import React, { useRef, useState } from "react";
import * as THREE from "three";
import { Canvas } from "@react-three/fiber";
import Slide from "./Slide";
import SlideProgressSlider from "./SlideProgressSlider";

export default function App() {
  const [progress, setProgress] = useState(0);
  const slideRef1 = useRef<THREE.Mesh>(null);
  const slideRef2 = useRef<THREE.Mesh>(null);

  const handleProgressChange = (value: number) => {
    setProgress(value);
  };

  return (
    <div style={{ width: "100vw", height: "100vh", position: "relative" }}>
      <Canvas camera={{ position: [0, 0, 100], fov: 80 }}>
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
      <SlideProgressSlider
        progress={progress}
        onChange={handleProgressChange}
      />
    </div>
  );
}
