import * as THREE from "three";

export class SlideGeometry extends THREE.BufferGeometry {
  constructor(
    width: number,
    height: number,
    widthSegments: number,
    heightSegments: number
  ) {
    super();

    const plane = new THREE.PlaneGeometry(
      width,
      height,
      widthSegments,
      heightSegments
    );
    this.separateFaces(plane);

    this.setAttribute("position", plane.getAttribute("position"));
    this.setAttribute("uv", plane.getAttribute("uv"));

    this.computeVertexNormals();

    this.createAttribute("aAnimation", 2);
    this.createAttribute("aStartPosition", 3);
    this.createAttribute("aControl0", 3);
    this.createAttribute("aControl1", 3);
    this.createAttribute("aEndPosition", 3);
  }

  separateFaces(geometry: THREE.BufferGeometry) {
    const positionAttribute = geometry.getAttribute(
      "position"
    ) as THREE.BufferAttribute;
    const uvAttribute = geometry.getAttribute("uv") as THREE.BufferAttribute;

    const positions = [];
    const uvs = [];

    for (let i = 0; i < positionAttribute.count; i += 3) {
      for (let j = 0; j < 3; j++) {
        positions.push(
          positionAttribute.getX(i + j),
          positionAttribute.getY(i + j),
          positionAttribute.getZ(i + j)
        );
        uvs.push(uvAttribute.getX(i + j), uvAttribute.getY(i + j));
      }
    }

    geometry.setAttribute(
      "position",
      new THREE.Float32BufferAttribute(positions, 3)
    );
    geometry.setAttribute("uv", new THREE.Float32BufferAttribute(uvs, 2));
  }

  createAttribute(name: string, itemSize: number) {
    const count = this.getAttribute("position").count;
    const attribute = new THREE.BufferAttribute(
      new Float32Array(count * itemSize),
      itemSize
    );
    this.setAttribute(name, attribute);
    return attribute;
  }

  setAnimationData(animationPhase: "in" | "out") {
    const aAnimation = this.getAttribute("aAnimation") as THREE.BufferAttribute;
    const aStartPosition = this.getAttribute(
      "aStartPosition"
    ) as THREE.BufferAttribute;
    const aControl0 = this.getAttribute("aControl0") as THREE.BufferAttribute;
    const aControl1 = this.getAttribute("aControl1") as THREE.BufferAttribute;
    const aEndPosition = this.getAttribute(
      "aEndPosition"
    ) as THREE.BufferAttribute;

    const minDuration = 0.8;
    const maxDuration = 1.2;
    const maxDelayX = 0.9;
    const maxDelayY = 0.125;
    const stretch = 0.11;

    const startPosition = new THREE.Vector3();
    const control0 = new THREE.Vector3();
    const control1 = new THREE.Vector3();
    const endPosition = new THREE.Vector3();

    const positionAttribute = this.getAttribute(
      "position"
    ) as THREE.BufferAttribute;

    for (let i = 0; i < positionAttribute.count; i++) {
      const i2 = i * 2;
      const i3 = i * 3;

      const x = positionAttribute.getX(i);
      const y = positionAttribute.getY(i);
      const z = positionAttribute.getZ(i);

      const duration = THREE.MathUtils.randFloat(minDuration, maxDuration);
      const delayX = THREE.MathUtils.mapLinear(x, -0.5, 0.5, 0.0, maxDelayX);
      const delayY =
        animationPhase === "in"
          ? THREE.MathUtils.mapLinear(Math.abs(y), 0, 0.5, 0.0, maxDelayY)
          : THREE.MathUtils.mapLinear(Math.abs(y), 0, 0.5, maxDelayY, 0.0);

      aAnimation.setXY(
        i,
        delayX + delayY + Math.random() * stretch * duration,
        duration
      );

      startPosition.set(x, y, z);
      endPosition.set(x, y, z);

      if (animationPhase === "in") {
        control0.copy(startPosition).sub(this.getControlPoint0(startPosition));
        control1.copy(startPosition).sub(this.getControlPoint1(startPosition));
      } else {
        control0.copy(startPosition).add(this.getControlPoint0(startPosition));
        control1.copy(startPosition).add(this.getControlPoint1(startPosition));
      }

      aStartPosition.setXYZ(
        i,
        startPosition.x,
        startPosition.y,
        startPosition.z
      );
      aControl0.setXYZ(i, control0.x, control0.y, control0.z);
      aControl1.setXYZ(i, control1.x, control1.y, control1.z);
      aEndPosition.setXYZ(i, endPosition.x, endPosition.y, endPosition.z);
    }
  }

  getControlPoint0(centroid: THREE.Vector3) {
    return new THREE.Vector3(
      THREE.MathUtils.randFloat(0.1, 0.3) * 50 * Math.sign(centroid.x),
      THREE.MathUtils.randFloat(0.1, 0.3) * 70 * Math.sign(centroid.y),
      THREE.MathUtils.randFloatSpread(20)
    );
  }

  getControlPoint1(centroid: THREE.Vector3) {
    return new THREE.Vector3(
      THREE.MathUtils.randFloat(0.3, 0.6) * 50 * Math.sign(centroid.x),
      -THREE.MathUtils.randFloat(0.3, 0.6) * 70 * Math.sign(centroid.y),
      THREE.MathUtils.randFloatSpread(20)
    );
  }
}
