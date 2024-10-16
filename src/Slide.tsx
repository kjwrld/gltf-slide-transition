import React, {
  useRef,
  useMemo,
  useEffect,
  forwardRef,
  ForwardedRef,
} from "react";
import * as THREE from "three";
import { useFrame, extend } from "@react-three/fiber";
import BAS from "./utils/BAS";
import CustomSlideShaderMaterial from "./SlideShaderMaterial";

extend({ CustomSlideShaderMaterial });

declare global {
  namespace JSX {
    interface IntrinsicElements {
      customSlideShaderMaterial: React.PropsWithChildren<
        Partial<CustomSlideShaderMaterial> & {
          ref?: React.Ref<CustomSlideShaderMaterial>;
        }
      >;
    }
  }
}

interface SlideProps {
  width: number;
  height: number;
  animationPhase: "in" | "out";
  progress: number;
}

export interface SlideRef {
  setImage: (image: HTMLImageElement) => void;
}

function getControlPoint0(centroid: THREE.Vector3) {
  const signY = Math.sign(centroid.y);
  return new THREE.Vector3(
    THREE.MathUtils.randFloat(0.1, 0.3) * 50,
    signY * THREE.MathUtils.randFloat(0.1, 0.3) * 70,
    THREE.MathUtils.randFloatSpread(20)
  );
}

function getControlPoint1(centroid: THREE.Vector3) {
  const signY = Math.sign(centroid.y);
  return new THREE.Vector3(
    THREE.MathUtils.randFloat(0.3, 0.6) * 50,
    -signY * THREE.MathUtils.randFloat(0.3, 0.6) * 70,
    THREE.MathUtils.randFloatSpread(20)
  );
}

const Slide = forwardRef<SlideRef, SlideProps>(
  (
    { width, height, animationPhase, progress }: SlideProps,
    ref: ForwardedRef<SlideRef>
  ) => {
    const meshRef = useRef<THREE.Mesh>(null);
    const materialRef = useRef<CustomSlideShaderMaterial>(null);

    const geometry = useMemo(() => {
      const plane = new THREE.PlaneGeometry(
        width,
        height,
        width * 2,
        height * 2
      );
      BAS.Utils.separateFaces(plane);

      const aAnimation = new Float32Array(plane.attributes.position.count * 2);
      const aStartPosition = new Float32Array(
        plane.attributes.position.count * 3
      );
      const aControl0 = new Float32Array(plane.attributes.position.count * 3);
      const aControl1 = new Float32Array(plane.attributes.position.count * 3);
      const aEndPosition = new Float32Array(
        plane.attributes.position.count * 3
      );

      const minDuration = 0.8;
      const maxDuration = 1.2;
      const maxDelayX = 0.9;
      const maxDelayY = 0.125;
      const stretch = 0.11;

      const startPosition = new THREE.Vector3();
      const control0 = new THREE.Vector3();
      const control1 = new THREE.Vector3();
      const endPosition = new THREE.Vector3();

      for (
        let faceIndex = 0, i = 0, i2 = 0, i3 = 0;
        faceIndex < plane.attributes.position.count / 3;
        faceIndex++, i += 3, i2 += 6, i3 += 9
      ) {
        const centroid = BAS.Utils.computeCentroid(plane, faceIndex);

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

        for (let v = 0; v < 6; v += 2) {
          aAnimation[i2 + v] =
            delayX + delayY + Math.random() * stretch * duration;
          aAnimation[i2 + v + 1] = duration;
        }

        endPosition.copy(centroid);
        startPosition.copy(centroid);

        if (animationPhase === "in") {
          control0.copy(centroid).sub(getControlPoint0(centroid));
          control1.copy(centroid).sub(getControlPoint1(centroid));
        } else {
          control0.copy(centroid).add(getControlPoint0(centroid));
          control1.copy(centroid).add(getControlPoint1(centroid));
        }

        for (let v = 0; v < 9; v += 3) {
          aStartPosition[i3 + v] = startPosition.x;
          aStartPosition[i3 + v + 1] = startPosition.y;
          aStartPosition[i3 + v + 2] = startPosition.z;

          aControl0[i3 + v] = control0.x;
          aControl0[i3 + v + 1] = control0.y;
          aControl0[i3 + v + 2] = control0.z;

          aControl1[i3 + v] = control1.x;
          aControl1[i3 + v + 1] = control1.y;
          aControl1[i3 + v + 2] = control1.z;

          aEndPosition[i3 + v] = endPosition.x;
          aEndPosition[i3 + v + 1] = endPosition.y;
          aEndPosition[i3 + v + 2] = endPosition.z;
        }
      }

      plane.setAttribute(
        "aAnimation",
        new THREE.BufferAttribute(aAnimation, 2)
      );
      plane.setAttribute(
        "aStartPosition",
        new THREE.BufferAttribute(aStartPosition, 3)
      );
      plane.setAttribute("aControl0", new THREE.BufferAttribute(aControl0, 3));
      plane.setAttribute("aControl1", new THREE.BufferAttribute(aControl1, 3));
      plane.setAttribute(
        "aEndPosition",
        new THREE.BufferAttribute(aEndPosition, 3)
      );

      return plane;
    }, [width, height, animationPhase]);

    const setImage = (image: HTMLImageElement) => {
      if (materialRef.current) {
        const texture = new THREE.Texture(image);
        texture.needsUpdate = true;
        materialRef.current.uniforms.map.value = texture;
      }
    };

    useFrame((state) => {
      if (materialRef.current) {
        materialRef.current.uniforms.uTime.value = state.clock.getElapsedTime();
        materialRef.current.uniforms.uProgress.value =
          animationPhase === "in" ? progress : 1 - progress;
      }
    });

    React.useImperativeHandle(
      ref,
      () => ({
        setImage,
      }),
      []
    );

    return (
      <mesh ref={meshRef} geometry={geometry}>
        <customSlideShaderMaterial
          ref={materialRef}
          uniforms={{
            uTime: { value: 0 },
            uProgress: { value: animationPhase === "in" ? 0 : 1 },
            map: { value: null },
          }}
        />
      </mesh>
    );
  }
);

export default Slide;
