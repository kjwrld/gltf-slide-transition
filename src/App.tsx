import * as THREE from "three";
import React, { useRef, useEffect, useState } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import { gsap } from "gsap";
import Slide from "./Slide";
import SlideProgressSlider from "./SlideProgressSlider";

export default function App() {
  const slideRef1 = useRef<THREE.Mesh>(null);
  const slideRef2 = useRef<THREE.Mesh>(null);
  const [progress, setProgress] = useState(0);
  const timelineRef = useRef<gsap.core.Timeline | null>(null);

  useEffect(() => {
    if (slideRef1.current && slideRef2.current) {
      const material1 = slideRef1.current.material as THREE.ShaderMaterial;
      const material2 = slideRef2.current.material as THREE.ShaderMaterial;

      const tl = gsap.timeline({ paused: true });
      tl.to(
        material1.uniforms.uTime,
        { value: 3, duration: 3, ease: "power2.inOut" },
        0
      );
      tl.to(
        material2.uniforms.uTime,
        { value: 3, duration: 3, ease: "power2.inOut" },
        0
      );

      timelineRef.current = tl;
    }
  }, []);

  const handleSliderChange = (value: number) => {
    setProgress(value);
    if (timelineRef.current) {
      timelineRef.current.progress(value);
    }
  };

  return (
    <div style={{ width: "100vw", height: "100vh", position: "relative" }}>
      <Canvas camera={{ position: [0, 0, 100], fov: 100 }}>
        <OrbitControls enableZoom={true} />
        <Slide
          ref={slideRef1}
          imageUrl="https://s3-us-west-2.amazonaws.com/s.cdpn.io/175711/winter.jpg"
          width={100}
          height={60}
          animationPhase="out"
        />
        <Slide
          ref={slideRef2}
          imageUrl="https://s3-us-west-2.amazonaws.com/s.cdpn.io/175711/spring.jpg"
          width={100}
          height={60}
          animationPhase="in"
        />
      </Canvas>
      <SlideProgressSlider progress={progress} onChange={handleSliderChange} />
    </div>
  );
}
