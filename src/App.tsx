import * as THREE from "three";
import React, { useRef, useState } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import Slide from "./Slide";
import SlideProgressSlider from "./SlideProgressSlider";

export default function App() {
  const slideRef1 = useRef<THREE.Mesh>(null);
  const slideRef2 = useRef<THREE.Mesh>(null);
  const [progress, setProgress] = useState(0);

  const handleSliderChange = (value: number) => {
    setProgress(value);
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
          progress={progress}
        />
        <Slide
          ref={slideRef2}
          imageUrl="https://s3-us-west-2.amazonaws.com/s.cdpn.io/175711/spring.jpg"
          width={100}
          height={60}
          animationPhase="in"
          progress={progress}
        />
      </Canvas>
      <SlideProgressSlider progress={progress} onChange={handleSliderChange} />
      <div style={{ position: "absolute", top: 10, left: 10, color: "white" }}>
        Progress: {progress.toFixed(2)}
      </div>
    </div>
  );
}
