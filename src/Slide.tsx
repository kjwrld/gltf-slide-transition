import { useLoader } from "@react-three/fiber";
import * as THREE from "three";
import { forwardRef, useRef, useEffect } from "react";
import gsap from "gsap";

type SlideProps = {
  imageUrl: string;
  initialPosition: [number, number, number];
  targetPosition: [number, number, number];
};

const Slide = forwardRef<THREE.Mesh, SlideProps>(
  ({ imageUrl, initialPosition, targetPosition }, ref) => {
    const meshRef = useRef<THREE.Mesh>(null);
    const texture = useLoader(THREE.TextureLoader, imageUrl);

    useEffect(() => {
      if (!meshRef.current) return;

      gsap.fromTo(
        meshRef.current.position,
        { x: initialPosition[0], y: initialPosition[1], z: initialPosition[2] },
        {
          x: targetPosition[0],
          y: targetPosition[1],
          z: targetPosition[2],
          duration: 2,
          ease: "power2.inOut",
          repeat: -1,
          yoyo: true,
        }
      );
    }, [initialPosition, targetPosition]);

    return (
      <mesh ref={ref || meshRef} position={initialPosition}>
        <planeGeometry args={[100, 60]} />
        <meshBasicMaterial map={texture} />
      </mesh>
    );
  }
);

export default Slide;
