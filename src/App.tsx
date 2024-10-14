import * as THREE from "three";
import { Canvas } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import Slide from "./Slide";
import "./App.css";

function App() {
  return (
    <Canvas camera={{ position: [0, 0, 60], fov: 80 }}>
      <OrbitControls enableZoom={false} />
      <ambientLight intensity={0.5} />
      <Slide
        imageUrl="https://s3-us-west-2.amazonaws.com/s.cdpn.io/175711/winter.jpg"
        initialPosition={[-60, 0, 0]}
        targetPosition={[0, 0, 0]}
      />
      <Slide
        imageUrl="https://s3-us-west-2.amazonaws.com/s.cdpn.io/175711/spring.jpg"
        initialPosition={[60, 0, 0]}
        targetPosition={[0, 0, 0]}
      />
    </Canvas>
  );
}

export default App;
