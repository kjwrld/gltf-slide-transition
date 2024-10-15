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
    geometry.setIndex(newIndex);
  },

  computeCentroid: (geometry: THREE.BufferGeometry, face: number[]) => {
    const position = geometry.getAttribute("position");
    const centroid = new THREE.Vector3();

    for (let i = 0; i < 3; i++) {
      centroid.add(
        new THREE.Vector3(
          position.getX(face[i]),
          position.getY(face[i]),
          position.getZ(face[i])
        )
      );
    }

    centroid.divideScalar(3);
    return centroid;
  },

  randomInBox: (box: THREE.Box3) => {
    return new THREE.Vector3(
      THREE.MathUtils.randFloat(box.min.x, box.max.x),
      THREE.MathUtils.randFloat(box.min.y, box.max.y),
      THREE.MathUtils.randFloat(box.min.z, box.max.z)
    );
  },

  randomAxis: () => {
    return new THREE.Vector3(
      THREE.MathUtils.randFloatSpread(2.0),
      THREE.MathUtils.randFloatSpread(2.0),
      THREE.MathUtils.randFloatSpread(2.0)
    ).normalize();
  },
};
