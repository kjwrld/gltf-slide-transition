import * as THREE from "three";

export const Utils = {
  separateFaces: (geometry: THREE.BufferGeometry) => {
    const position = geometry.getAttribute("position");
    const newPosition = [];
    const newIndex = [];

    for (let i = 0; i < position.count; i += 3) {
      for (let j = 0; j < 3; j++) {
        newPosition.push(
          position.getX(i + j),
          position.getY(i + j),
          position.getZ(i + j)
        );
        newIndex.push(newPosition.length / 3 - 1);
      }
    }

    geometry.setAttribute(
      "position",
      new THREE.Float32BufferAttribute(newPosition, 3)
    );
    console.log(geometry.attributes);
    geometry.setIndex(newIndex);
  },

  computeCentroid: (
    geometry: THREE.BufferGeometry,
    faceIndex: number,
    v?: THREE.Vector3
  ) => {
    const positionAttribute = geometry.getAttribute("position");
    const a = new THREE.Vector3().fromBufferAttribute(
      positionAttribute,
      faceIndex * 3
    );
    const b = new THREE.Vector3().fromBufferAttribute(
      positionAttribute,
      faceIndex * 3 + 1
    );
    const c = new THREE.Vector3().fromBufferAttribute(
      positionAttribute,
      faceIndex * 3 + 2
    );

    v = v || new THREE.Vector3();

    v.add(a).add(b).add(c).divideScalar(3);

    return v;
  },

  randomInBox: (box: THREE.Box3, v?: THREE.Vector3) => {
    v = v || new THREE.Vector3();

    v.x = THREE.MathUtils.randFloat(box.min.x, box.max.x);
    v.y = THREE.MathUtils.randFloat(box.min.y, box.max.y);
    v.z = THREE.MathUtils.randFloat(box.min.z, box.max.z);

    return v;
  },
};

export const BAS = {
  Utils,
};

export default BAS;
