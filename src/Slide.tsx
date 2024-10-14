import { useLoader, useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { forwardRef, useEffect, useRef } from "react";
import gsap from "gsap";

type SlideProps = {
  imageUrl: string;
  position?: [number, number, number];
};

const Slide = forwardRef<THREE.Mesh, SlideProps>(
  ({ imageUrl, position }, ref) => {
    const meshRef = useRef<THREE.Mesh>(null);
    const texture = useLoader(THREE.TextureLoader, imageUrl);

    useEffect(() => {
      if (meshRef.current) {
        // Animate rotation and scale using GSAP
        gsap.fromTo(
          meshRef.current.rotation,
          { y: 0 },
          { y: Math.PI * 2, duration: 3, repeat: -1, ease: "power1.inOut" }
        );

        gsap.fromTo(
          meshRef.current.scale,
          { x: 1, y: 1, z: 1 },
          {
            x: 1.2,
            y: 1.2,
            z: 1.2,
            duration: 1,
            repeat: -1,
            yoyo: true,
            ease: "sine.inOut",
          }
        );
      }
    }, []);

    return (
      <mesh ref={ref || meshRef} position={position || [0, 0, 0]}>
        <planeGeometry args={[100, 60, 100, 60]} />
        <meshBasicMaterial map={texture} />
      </mesh>
    );
  }
);

export default Slide;
