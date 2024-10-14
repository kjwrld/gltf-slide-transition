// src/components/Slide.tsx
import { useFrame, useLoader } from "@react-three/fiber";
import * as THREE from "three";
import { forwardRef, useRef, useState } from "react";
import { TextureLoader } from "three";

type SlideProps = {
  imageUrl: string;
};

const Slide = forwardRef<THREE.Mesh, SlideProps>(({ imageUrl }, ref) => {
  const meshRef = useRef<THREE.Mesh>(null);
  const texture = useLoader(TextureLoader, imageUrl);
  const [time, setTime] = useState(0);

  useFrame(() => {
    if (meshRef.current) {
      meshRef.current.rotation.y += 0.01; // Basic animation for now
    }
  });

  return (
    <mesh ref={ref || meshRef}>
      <planeGeometry args={[100, 60, 100, 60]} />
      <meshBasicMaterial map={texture} />
    </mesh>
  );
});

export default Slide;
