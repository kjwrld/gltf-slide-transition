import * as THREE from "three";
import React, { useMemo, forwardRef } from "react";
import { extend, Object3DNode } from "@react-three/fiber";

class SlideMaterialImpl extends THREE.ShaderMaterial {
  animationPhase: "in" | "out";

  constructor(animationPhase: "in" | "out") {
    super({
      uniforms: {
        uTime: { value: 0 },
        uProgress: { value: 0 },
        map: { value: null },
      },
      vertexShader: `
        uniform float uTime;
        uniform float uProgress;
        attribute vec2 aAnimation;
        attribute vec3 aStartPosition;
        attribute vec3 aControl0;
        attribute vec3 aControl1;
        attribute vec3 aEndPosition;

        varying vec2 vUv;

        vec3 cubicBezier(vec3 p0, vec3 c0, vec3 c1, vec3 p1, float t) {
          float tn = 1.0 - t;
          return tn * tn * tn * p0 + 3.0 * tn * tn * t * c0 + 3.0 * tn * t * t * c1 + t * t * t * p1;
        }

        void main() {
          vUv = uv;
          
          float tDelay = aAnimation.x;
          float tDuration = aAnimation.y;
          float tTime = clamp(uProgress - tDelay, 0.0, tDuration);
          float tProgress = tTime / tDuration;

          vec3 newPosition = cubicBezier(aStartPosition, aControl0, aControl1, aEndPosition, tProgress);
          
          gl_Position = projectionMatrix * modelViewMatrix * vec4(newPosition, 1.0);
        }
      `,
      fragmentShader: `
        uniform sampler2D map;
        varying vec2 vUv;

        void main() {
          vec4 texColor = texture2D(map, vUv);
          gl_FragColor = texColor;
        }
      `,
      side: THREE.DoubleSide,
      transparent: true,
    });

    this.animationPhase = animationPhase;
  }
}

extend({ SlideMaterialImpl });

declare global {
  namespace JSX {
    interface IntrinsicElements {
      slideMaterialImpl: Object3DNode<
        SlideMaterialImpl,
        typeof SlideMaterialImpl
      > & { animationPhase: "in" | "out" };
    }
  }
}

interface SlideMaterialProps {
  map: THREE.Texture;
  animationPhase: "in" | "out";
}

export const SlideMaterial = forwardRef<SlideMaterialImpl, SlideMaterialProps>(
  ({ map, animationPhase }, ref) => {
    const uniforms = useMemo(
      () => ({
        uTime: { value: 0 },
        uProgress: { value: 0 },
        map: { value: map },
      }),
      [map]
    );

    return (
      <slideMaterialImpl
        ref={ref}
        uniforms={uniforms}
        animationPhase={animationPhase}
      />
    );
  }
);

SlideMaterial.displayName = "SlideMaterial";

export type { SlideMaterialImpl };
