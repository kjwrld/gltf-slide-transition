import React, { useRef, useState, useEffect } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import Slide, { SlideRef } from "./Slide";
import ProgressSlider from "./ProgressSlider";

export default function App() {
  const [progress, setProgress] = useState(0);
  const slideRef1 = useRef<SlideRef>(null);
  const slideRef2 = useRef<SlideRef>(null);

  useEffect(() => {
    const loadImage = (url: string): Promise<HTMLImageElement> => {
      return new Promise((resolve, reject) => {
        const img = new Image();
        img.crossOrigin = "Anonymous";
        img.onload = () => resolve(img);
        img.onerror = reject;
        img.src = url;
      });
    };

    const setupSlides = async () => {
      try {
        const [img1, img2] = await Promise.all([
          loadImage(
            "https://s3-us-west-2.amazonaws.com/s.cdpn.io/175711/winter.jpg"
          ),
          loadImage(
            "https://s3-us-west-2.amazonaws.com/s.cdpn.io/175711/spring.jpg"
          ),
        ]);

        if (slideRef1.current && slideRef2.current) {
          slideRef1.current.setImage(img1);
          slideRef2.current.setImage(img2);
        }
      } catch (error) {
        console.error("Error loading images:", error);
      }
    };

    setupSlides();
  }, []);

  const handleProgressChange = (newProgress: number) => {
    setProgress(newProgress);
  };

  return (
    <div className="w-full h-screen">
      <Canvas camera={{ position: [0, 0, 100], fov: 100 }}>
        <OrbitControls enableZoom={true} />
        <Slide
          ref={slideRef1}
          width={100}
          height={60}
          animationPhase="out"
          progress={progress}
        />
        <Slide
          ref={slideRef2}
          width={100}
          height={60}
          animationPhase="in"
          progress={progress}
        />
      </Canvas>
      <ProgressSlider value={progress} onChange={handleProgressChange} />
    </div>
  );
}
