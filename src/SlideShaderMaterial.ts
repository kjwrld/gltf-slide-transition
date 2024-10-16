import * as THREE from "three";
import { extend } from "@react-three/fiber";
import BaseAnimationMaterial from "./BaseAnimationMaterial";

type UniformValue<T> = { value: T };

export interface SlideShaderUniforms {
  uTime: UniformValue<number>;
  uProgress: UniformValue<number>;
  map: UniformValue<THREE.Texture | null>;
  [key: string]: UniformValue<any>;
}

export interface SlideShaderProps {
  uniforms?: Partial<{
    [K in keyof SlideShaderUniforms]: SlideShaderUniforms[K]["value"];
  }>;
  vertexShader?: string;
  fragmentShader?: string;
}

const defaultUniforms: SlideShaderUniforms = {
  uTime: { value: 0 },
  uProgress: { value: 0 },
  map: { value: null },
};

const vertexShader = `
  uniform float uTime;
  uniform float uProgress;
  attribute vec2 aAnimation;
  attribute vec3 aStartPosition;
  attribute vec3 aControl0;
  attribute vec3 aControl1;
  attribute vec3 aEndPosition;

  varying vec2 vUv;

  vec3 cubicBezier(vec3 p0, vec3 c0, vec3 c1, vec3 p1, float t) {
    float tn = 1.0 - t;
    return tn * tn * tn * p0 + 3.0 * tn * tn * t * c0 + 3.0 * tn * t * t * c1 + t * t * t * p1;
  }

  float easeInOutCubic(float t) {
    return t < 0.5 ? 4.0 * t * t * t : 1.0 - pow(-2.0 * t + 2.0, 3.0) / 2.0;
  }

  void main() {
    vUv = uv;
    
    float tDelay = aAnimation.x;
    float tDuration = aAnimation.y;
    float tTime = clamp(uProgress - tDelay, 0.0, tDuration);
    float tProgress = easeInOutCubic(tTime / tDuration);

    vec3 newPosition = cubicBezier(aStartPosition, aControl0, aControl1, aEndPosition, tProgress);
    
    gl_Position = projectionMatrix * modelViewMatrix * vec4(newPosition, 1.0);
  }
`;

const fragmentShader = `
  uniform sampler2D map;
  varying vec2 vUv;

  void main() {
    gl_FragColor = texture2D(map, vUv);
  }
`;

class CustomSlideShaderMaterial extends BaseAnimationMaterial {
  constructor(parameters: SlideShaderProps = {}) {
    const mergedUniforms: SlideShaderUniforms = { ...defaultUniforms };

    if (parameters.uniforms) {
      Object.entries(parameters.uniforms).forEach(([key, value]) => {
        if (key in mergedUniforms) {
          mergedUniforms[key].value = value;
        } else {
          mergedUniforms[key] = { value };
        }
      });
    }

    super(
      {
        vertexShader: parameters.vertexShader || vertexShader,
        fragmentShader: parameters.fragmentShader || fragmentShader,
        uniforms: mergedUniforms,
      },
      mergedUniforms
    );
  }
}

extend({ CustomSlideShaderMaterial });

export default CustomSlideShaderMaterial;
