import React, {
  useRef,
  useMemo,
  useEffect,
  forwardRef,
  ForwardedRef,
} from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";
import { Utils } from "./Utils";
import CustomSlideShaderMaterial, {
  SlideShaderProps,
} from "./SlideShaderMaterial";

interface SlideProps {
  imageUrl: string;
  width: number;
  height: number;
  animationPhase: "in" | "out";
}

const Slide = forwardRef<THREE.Mesh, SlideProps>(
  (
    { imageUrl, width, height, animationPhase }: SlideProps,
    ref: ForwardedRef<THREE.Mesh>
  ) => {
    const materialRef = useRef<CustomSlideShaderMaterial>(null);

    const geometry = useMemo(() => {
      const planeGeometry = new THREE.PlaneGeometry(
        width,
        height,
        width * 2,
        height * 2
      );
      Utils.separateFaces(planeGeometry);

      const geometry = new THREE.BufferGeometry();
      geometry.setAttribute("position", planeGeometry.getAttribute("position"));
      geometry.setAttribute("uv", planeGeometry.getAttribute("uv"));

      const vertexCount = geometry.getAttribute("position").count;
      const aAnimation = new Float32Array(vertexCount * 2);
      const aStartPosition = new Float32Array(vertexCount * 3);
      const aControl0 = new Float32Array(vertexCount * 3);
      const aControl1 = new Float32Array(vertexCount * 3);
      const aEndPosition = new Float32Array(vertexCount * 3);

      const minDuration = 0.8;
      const maxDuration = 1.2;
      const maxDelayX = 0.9;
      const maxDelayY = 0.125;
      const stretch = 0.11;

      for (let i = 0; i < vertexCount; i += 3) {
        const face = [i, i + 1, i + 2];
        const centroid = Utils.computeCentroid(geometry, face);

        const duration = THREE.MathUtils.randFloat(minDuration, maxDuration);
        const delayX = THREE.MathUtils.mapLinear(
          centroid.x,
          -width * 0.5,
          width * 0.5,
          0.0,
          maxDelayX
        );
        const delayY =
          animationPhase === "in"
            ? THREE.MathUtils.mapLinear(
                Math.abs(centroid.y),
                0,
                height * 0.5,
                0.0,
                maxDelayY
              )
            : THREE.MathUtils.mapLinear(
                Math.abs(centroid.y),
                0,
                height * 0.5,
                maxDelayY,
                0.0
              );

        for (let j = 0; j < 3; j++) {
          const index = i + j;
          aAnimation[index * 2] =
            delayX + delayY + Math.random() * stretch * duration;
          aAnimation[index * 2 + 1] = duration;

          aStartPosition[index * 3] = centroid.x;
          aStartPosition[index * 3 + 1] = centroid.y;
          aStartPosition[index * 3 + 2] = centroid.z;

          aEndPosition[index * 3] = centroid.x;
          aEndPosition[index * 3 + 1] = centroid.y;
          aEndPosition[index * 3 + 2] = centroid.z;

          const controlPoint0 = Utils.randomInBox(
            new THREE.Box3(
              new THREE.Vector3(-width * 0.3, -height * 0.3, -20),
              new THREE.Vector3(width * 0.3, height * 0.3, 20)
            )
          );
          const controlPoint1 = Utils.randomInBox(
            new THREE.Box3(
              new THREE.Vector3(-width * 0.3, -height * 0.3, -20),
              new THREE.Vector3(width * 0.3, height * 0.3, 20)
            )
          );

          if (animationPhase === "in") {
            aControl0[index * 3] = centroid.x - controlPoint0.x;
            aControl0[index * 3 + 1] = centroid.y - controlPoint0.y;
            aControl0[index * 3 + 2] = centroid.z - controlPoint0.z;

            aControl1[index * 3] = centroid.x - controlPoint1.x;
            aControl1[index * 3 + 1] = centroid.y - controlPoint1.y;
            aControl1[index * 3 + 2] = centroid.z - controlPoint1.z;
          } else {
            aControl0[index * 3] = centroid.x + controlPoint0.x;
            aControl0[index * 3 + 1] = centroid.y + controlPoint0.y;
            aControl0[index * 3 + 2] = centroid.z + controlPoint0.z;

            aControl1[index * 3] = centroid.x + controlPoint1.x;
            aControl1[index * 3 + 1] = centroid.y + controlPoint1.y;
            aControl1[index * 3 + 2] = centroid.z + controlPoint1.z;
          }
        }
      }

      geometry.setAttribute(
        "aAnimation",
        new THREE.BufferAttribute(aAnimation, 2)
      );
      geometry.setAttribute(
        "aStartPosition",
        new THREE.BufferAttribute(aStartPosition, 3)
      );
      geometry.setAttribute(
        "aControl0",
        new THREE.BufferAttribute(aControl0, 3)
      );
      geometry.setAttribute(
        "aControl1",
        new THREE.BufferAttribute(aControl1, 3)
      );
      geometry.setAttribute(
        "aEndPosition",
        new THREE.BufferAttribute(aEndPosition, 3)
      );

      return geometry;
    }, [width, height, animationPhase]);

    const material = useMemo(() => {
      const texture = new THREE.TextureLoader().load(imageUrl);
      return new CustomSlideShaderMaterial({
        uniforms: {
          map: texture,
          uTime: 0,
        },
      });
    }, [imageUrl]);

    useEffect(() => {
      if (materialRef.current) {
        materialRef.current.uniforms.uTime.value = 0;
      }
    }, []);

    useFrame((state) => {
      if (materialRef.current) {
        materialRef.current.uniforms.uTime.value = state.clock.getElapsedTime();
      }
    });

    return (
      <mesh ref={ref} geometry={geometry}>
        <primitive object={material} ref={materialRef} attach="material" />
      </mesh>
    );
  }
);

export default Slide;
