import * as THREE from "three";
import { shaderMaterial } from "@react-three/drei";
import { extend } from "@react-three/fiber";
import BaseAnimationMaterial from "./BaseAnimationMaterial";

// Define the uniforms and their types
export interface SlideShaderUniforms {
  uTime: number;
  map: THREE.Texture;
}

// Define the shader properties
export interface SlideShaderProps {
  uniforms: SlideShaderUniforms;
  vertexShader: string;
  fragmentShader: string;
}

// Create the shader properties
const slideShaderProps: SlideShaderProps = {
  uniforms: {
    uTime: 0,
    map: new THREE.Texture(),
  },
  vertexShader: `
    uniform float uTime;
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
      float tTime = clamp(uTime - tDelay, 0.0, tDuration);
      float tProgress = easeInOutCubic(tTime / tDuration);

      vec3 newPosition = cubicBezier(aStartPosition, aControl0, aControl1, aEndPosition, tProgress);
      
      gl_Position = projectionMatrix * modelViewMatrix * vec4(newPosition, 1.0);
    }
  `,
  fragmentShader: `
    uniform sampler2D map;
    varying vec2 vUv;

    void main() {
      gl_FragColor = texture2D(map, vUv);
    }
  `,
};
const SlideShaderMaterial = shaderMaterial(
  { ...slideShaderProps.uniforms },
  slideShaderProps.vertexShader,
  slideShaderProps.fragmentShader
);

class CustomSlideShaderMaterial extends BaseAnimationMaterial {
  constructor(parameters: Partial<SlideShaderProps>) {
    super(parameters, slideShaderProps);
  }
}

extend({ CustomSlideShaderMaterial });

export default CustomSlideShaderMaterial;
