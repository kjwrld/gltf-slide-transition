import { Canvas } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import { useRef } from "react";
import * as THREE from "three";
import Slide from "./Slide";
import "./App.css";

function App() {
  const slide1Ref = useRef<THREE.Mesh>(null);
  const slide2Ref = useRef<THREE.Mesh>(null);

  return (
    <>
      <div id="instructions">Click and drag to control the animation</div>
      <Canvas camera={{ position: [0, 0, 60], fov: 80 }}>
        <OrbitControls enableZoom={false} />
        <ambientLight intensity={0.5} />
        <Slide
          ref={slide1Ref}
          imageUrl="https://s3-us-west-2.amazonaws.com/s.cdpn.io/175711/winter.jpg"
        />
        <Slide
          ref={slide2Ref}
          imageUrl="https://s3-us-west-2.amazonaws.com/s.cdpn.io/175711/spring.jpg"
        />
      </Canvas>
    </>
  );
}

export default App;
