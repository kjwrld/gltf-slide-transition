import React, {
  useRef,
  useMemo,
  forwardRef,
  useImperativeHandle,
  useEffect,
} from "react";
import * as THREE from "three";
import { extend, useFrame, ThreeElements } from "@react-three/fiber";
import { shaderMaterial } from "@react-three/drei";
import { gsap } from "gsap";
import BAS from "./utils/BAS";

const SlideShaderMaterial = shaderMaterial(
  {
    uProgress: 0,
    map: new THREE.Texture(),
  },
  // vertex shader
  `
    uniform float uProgress;
    attribute float aProgress;
    attribute vec3 aStartPosition;
    attribute vec3 aEndPosition;

    varying float vProgress;
    varying vec2 vUv;

    void main() {
      vProgress = aProgress;
      vUv = uv;
      
      vec3 newPosition = mix(aStartPosition, aEndPosition, step(aProgress, uProgress));
      
      gl_Position = projectionMatrix * modelViewMatrix * vec4(newPosition, 1.0);
    }
  `,
  // fragment shader
  `
    uniform sampler2D map;
    uniform float uProgress;
    varying float vProgress;
    varying vec2 vUv;

    void main() {
      vec4 texColor = texture2D(map, vUv);
      
      // Blend between original color and white based on progress
      vec3 color = mix(texColor.rgb, vec3(1.0), step(vProgress, uProgress));
      
      gl_FragColor = vec4(color, 1.0);
    }
  `
);

extend({ SlideShaderMaterial });

declare module "@react-three/fiber" {
  interface ThreeElements {
    slideShaderMaterial: ThreeElements["shaderMaterial"] & {
      map?: THREE.Texture;
    };
  }
}

interface SlideProps {
  imageUrl: string;
  width: number;
  height: number;
  animationPhase: "in" | "out";
}

function getRandomEndPosition(
  startPosition: THREE.Vector3,
  maxDistance: number
) {
  const endPosition = startPosition.clone();
  endPosition.x += THREE.MathUtils.randFloatSpread(maxDistance);
  endPosition.y += THREE.MathUtils.randFloatSpread(maxDistance);
  endPosition.z += THREE.MathUtils.randFloatSpread(maxDistance / 2);
  return endPosition;
}

const Slide = forwardRef<THREE.Mesh, SlideProps>(
  ({ imageUrl, width, height, animationPhase }, ref) => {
    const meshRef = useRef<THREE.Mesh>(null);
    const materialRef = useRef<THREE.ShaderMaterial>(null);

    useImperativeHandle(ref, () => meshRef.current as THREE.Mesh, []);

    const geometry = useMemo(() => {
      const plane = new THREE.PlaneGeometry(width, height, width, height);

      const aProgress = new Float32Array(plane.attributes.position.count);
      const aStartPosition = new Float32Array(
        plane.attributes.position.count * 3
      );
      const aEndPosition = new Float32Array(
        plane.attributes.position.count * 3
      );

      for (let i = 0; i < plane.attributes.position.count; i++) {
        const startPosition = new THREE.Vector3().fromBufferAttribute(
          plane.attributes.position,
          i
        );
        const endPosition = getRandomEndPosition(startPosition, 20);

        aProgress[i] = Math.random();
        aStartPosition.set(
          [startPosition.x, startPosition.y, startPosition.z],
          i * 3
        );
        aEndPosition.set([endPosition.x, endPosition.y, endPosition.z], i * 3);
      }

      plane.setAttribute("aProgress", new THREE.BufferAttribute(aProgress, 1));
      plane.setAttribute(
        "aStartPosition",
        new THREE.BufferAttribute(aStartPosition, 3)
      );
      plane.setAttribute(
        "aEndPosition",
        new THREE.BufferAttribute(aEndPosition, 3)
      );

      return plane;
    }, [width, height]);

    const texture = useMemo(
      () => new THREE.TextureLoader().load(imageUrl),
      [imageUrl]
    );

    useEffect(() => {
      if (materialRef.current) {
        const duration = 3.0;
        gsap.fromTo(
          materialRef.current.uniforms.uProgress,
          { value: 0 },
          {
            value: 1,
            duration: duration,
            ease: "power1.inOut",
            repeat: -1,
            yoyo: true,
          }
        );
      }
    }, []);

    return (
      <mesh ref={meshRef} geometry={geometry}>
        <slideShaderMaterial
          ref={materialRef}
          map={texture}
          transparent
          uniforms-uProgress-value={0}
        />
      </mesh>
    );
  }
);

export default Slide;
