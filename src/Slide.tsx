import React, { useMemo, useRef } from "react";
import * as THREE from "three";
import { useFrame, useLoader } from "@react-three/fiber";
import { SlideMaterial, SlideMaterialImpl } from "./SlideMaterial";

interface SlideProps {
  width: number;
  height: number;
  animationPhase: "in" | "out";
  progress: number;
  imageUrl: string;
}

const createGeometry = (
  width: number,
  height: number,
  widthSegments: number,
  heightSegments: number,
  animationPhase: "in" | "out"
) => {
  const geometry = new THREE.PlaneGeometry(
    width,
    height,
    widthSegments,
    heightSegments
  );
  const position = geometry.attributes.position;
  const count = position.count;

  const aAnimation = new Float32Array(count * 2);
  const aStartPosition = new Float32Array(count * 3);
  const aControl0 = new Float32Array(count * 3);
  const aControl1 = new Float32Array(count * 3);
  const aEndPosition = new Float32Array(count * 3);

  const minDuration = 0.8;
  const maxDuration = 1.2;
  const maxDelayX = 0.9;
  const maxDelayY = 0.125;
  const stretch = 0.11;

  for (let i = 0; i < count; i++) {
    const x = position.getX(i);
    const y = position.getY(i);
    const z = position.getZ(i);

    const ix = x / width + 0.5;
    const iy = y / height + 0.5;

    const delayX = maxDelayX * ix;
    const delayY = maxDelayY * iy;

    const delay = delayX + delayY + Math.random() * stretch * maxDuration;
    const duration = THREE.MathUtils.randFloat(minDuration, maxDuration);

    aAnimation.set([delay, duration], i * 2);

    const startPosition = new THREE.Vector3(x, y, z);
    const endPosition = new THREE.Vector3(x, y, z);

    const controlPoint0 = new THREE.Vector3(
      x + THREE.MathUtils.randFloatSpread(0.3) * width,
      y + THREE.MathUtils.randFloatSpread(0.3) * height,
      THREE.MathUtils.randFloatSpread(20)
    );

    const controlPoint1 = new THREE.Vector3(
      x + THREE.MathUtils.randFloatSpread(0.6) * width,
      y + THREE.MathUtils.randFloatSpread(0.6) * height,
      THREE.MathUtils.randFloatSpread(20)
    );

    if (animationPhase === "in") {
      startPosition.sub(controlPoint0).sub(controlPoint1);
    } else {
      endPosition.add(controlPoint0).add(controlPoint1);
    }

    aStartPosition.set(startPosition.toArray(), i * 3);
    aEndPosition.set(endPosition.toArray(), i * 3);
    aControl0.set(controlPoint0.toArray(), i * 3);
    aControl1.set(controlPoint1.toArray(), i * 3);
  }

  geometry.setAttribute("aAnimation", new THREE.BufferAttribute(aAnimation, 2));
  geometry.setAttribute(
    "aStartPosition",
    new THREE.BufferAttribute(aStartPosition, 3)
  );
  geometry.setAttribute("aControl0", new THREE.BufferAttribute(aControl0, 3));
  geometry.setAttribute("aControl1", new THREE.BufferAttribute(aControl1, 3));
  geometry.setAttribute(
    "aEndPosition",
    new THREE.BufferAttribute(aEndPosition, 3)
  );

  return geometry;
};

export default function Slide({
  width,
  height,
  animationPhase,
  progress,
  imageUrl,
}: SlideProps) {
  const geometry = useMemo(
    () => createGeometry(width, height, 20, 20, animationPhase),
    [width, height, animationPhase]
  );
  const texture = useLoader(THREE.TextureLoader, imageUrl);
  const materialRef = useRef<SlideMaterialImpl>(null);

  useFrame(() => {
    if (materialRef.current) {
      materialRef.current.uniforms.uProgress.value = progress;
    }
  });

  return (
    <mesh geometry={geometry}>
      <SlideMaterial
        ref={materialRef}
        map={texture}
        animationPhase={animationPhase}
      />
    </mesh>
  );
}
