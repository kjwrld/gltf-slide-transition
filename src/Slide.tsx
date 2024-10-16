import React, { useRef, useMemo } from "react";
import * as THREE from "three";
import { extend, useFrame, ThreeElements } from "@react-three/fiber";
import { shaderMaterial } from "@react-three/drei";
import BAS from "./utils/BAS";

const SlideShaderMaterial = shaderMaterial(
  {
    uTime: 0,
    map: new THREE.Texture(),
  },
  // vertex shader
  `
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
  // fragment shader
  `
    uniform sampler2D map;
    varying vec2 vUv;

    void main() {
      gl_FragColor = texture2D(map, vUv);
    }
  `
);

extend({ SlideShaderMaterial });

declare module "@react-three/fiber" {
  interface ThreeElements {
    slideShaderMaterial: ThreeElements["shaderMaterial"] & {
      map?: THREE.Texture;
    };
  }
}

interface SlideProps {
  imageUrl: string;
  width: number;
  height: number;
  animationPhase: "in" | "out";
}

function getControlPoint0(centroid: THREE.Vector3) {
  const signY = Math.sign(centroid.y);
  return new THREE.Vector3(
    THREE.MathUtils.randFloat(0.1, 0.3) * 50,
    signY * THREE.MathUtils.randFloat(0.1, 0.3) * 70,
    THREE.MathUtils.randFloatSpread(20)
  );
}

function getControlPoint1(centroid: THREE.Vector3) {
  const signY = Math.sign(centroid.y);
  return new THREE.Vector3(
    THREE.MathUtils.randFloat(0.3, 0.6) * 50,
    -signY * THREE.MathUtils.randFloat(0.3, 0.6) * 70,
    THREE.MathUtils.randFloatSpread(20)
  );
}

const Slide: React.FC<SlideProps> = ({
  imageUrl,
  width,
  height,
  animationPhase,
}) => {
  const meshRef = useRef<THREE.Mesh>(null);
  const materialRef = useRef<THREE.ShaderMaterial>(null);

  const geometry = useMemo(() => {
    const plane = new THREE.PlaneGeometry(width, height, width * 2, height * 2);
    BAS.Utils.separateFaces(plane);

    const aAnimation = new Float32Array(plane.attributes.position.count * 2);
    const aStartPosition = new Float32Array(
      plane.attributes.position.count * 3
    );
    const aControl0 = new Float32Array(plane.attributes.position.count * 3);
    const aControl1 = new Float32Array(plane.attributes.position.count * 3);
    const aEndPosition = new Float32Array(plane.attributes.position.count * 3);

    const minDuration = 0.8;
    const maxDuration = 1.2;
    const maxDelayX = 0.9;
    const maxDelayY = 0.125;
    const stretch = 0.11;

    const startPosition = new THREE.Vector3();
    const control0 = new THREE.Vector3();
    const control1 = new THREE.Vector3();
    const endPosition = new THREE.Vector3();

    for (
      let faceIndex = 0, i = 0, i2 = 0, i3 = 0;
      faceIndex < plane.attributes.position.count / 3;
      faceIndex++, i += 3, i2 += 6, i3 += 9
    ) {
      const centroid = BAS.Utils.computeCentroid(plane, faceIndex);

      // animation
      const duration = THREE.MathUtils.randFloat(minDuration, maxDuration);
      const delayX = THREE.MathUtils.mapLinear(
        centroid.x,
        -width * 0.5,
        width * 0.5,
        0.0,
        maxDelayX
      );
      const delayY =
        animationPhase === "in"
          ? THREE.MathUtils.mapLinear(
              Math.abs(centroid.y),
              0,
              height * 0.5,
              0.0,
              maxDelayY
            )
          : THREE.MathUtils.mapLinear(
              Math.abs(centroid.y),
              0,
              height * 0.5,
              maxDelayY,
              0.0
            );

      for (let v = 0; v < 6; v += 2) {
        aAnimation[i2 + v] =
          delayX + delayY + Math.random() * stretch * duration;
        aAnimation[i2 + v + 1] = duration;
      }

      // positions
      endPosition.copy(centroid);
      startPosition.copy(centroid);

      if (animationPhase === "in") {
        control0.copy(centroid).sub(getControlPoint0(centroid));
        control1.copy(centroid).sub(getControlPoint1(centroid));
      } else {
        control0.copy(centroid).add(getControlPoint0(centroid));
        control1.copy(centroid).add(getControlPoint1(centroid));
      }

      for (let v = 0; v < 9; v += 3) {
        aStartPosition[i3 + v] = startPosition.x;
        aStartPosition[i3 + v + 1] = startPosition.y;
        aStartPosition[i3 + v + 2] = startPosition.z;

        aControl0[i3 + v] = control0.x;
        aControl0[i3 + v + 1] = control0.y;
        aControl0[i3 + v + 2] = control0.z;

        aControl1[i3 + v] = control1.x;
        aControl1[i3 + v + 1] = control1.y;
        aControl1[i3 + v + 2] = control1.z;

        aEndPosition[i3 + v] = endPosition.x;
        aEndPosition[i3 + v + 1] = endPosition.y;
        aEndPosition[i3 + v + 2] = endPosition.z;
      }
    }

    plane.setAttribute("aAnimation", new THREE.BufferAttribute(aAnimation, 2));
    plane.setAttribute(
      "aStartPosition",
      new THREE.BufferAttribute(aStartPosition, 3)
    );
    plane.setAttribute("aControl0", new THREE.BufferAttribute(aControl0, 3));
    plane.setAttribute("aControl1", new THREE.BufferAttribute(aControl1, 3));
    plane.setAttribute(
      "aEndPosition",
      new THREE.BufferAttribute(aEndPosition, 3)
    );

    return plane;
  }, [width, height, animationPhase]);

  const texture = useMemo(
    () => new THREE.TextureLoader().load(imageUrl),
    [imageUrl]
  );

  useFrame((state) => {
    if (materialRef.current) {
      materialRef.current.uniforms.uTime.value = state.clock.getElapsedTime();
    }
  });

  return (
    <mesh ref={meshRef} geometry={geometry}>
      <slideShaderMaterial
        ref={materialRef}
        map={texture}
        uniforms-uTime-value={0}
      />
    </mesh>
  );
};

export default Slide;
