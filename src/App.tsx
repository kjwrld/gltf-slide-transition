import * as THREE from "three";
import React, { useRef, useState } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import Slide from "./Slide";
import SlideProgressSlider from "./SlideProgressSlider";

export default function App() {
  const [progress, setProgress] = useState(0);

  return (
    <div style={{ width: "100vw", height: "100vh" }}>
      <Canvas camera={{ position: [0, 0, 100], fov: 45 }}>
        <OrbitControls />
        <Slide color="#ff0000" width={100} height={60} animationPhase="out" />
        <Slide color="#0000ff" width={100} height={60} animationPhase="in" />
      </Canvas>
      <input
        type="range"
        min="0"
        max="1"
        step="0.01"
        value={progress}
        onChange={(e) => setProgress(parseFloat(e.target.value))}
        style={{ position: "absolute", bottom: 20, left: 20, width: "200px" }}
      />
    </div>
  );
}
