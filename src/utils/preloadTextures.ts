import * as THREE from "three";

export const preloadTextures = (urls: string[]): Promise<THREE.Texture[]> => {
  const loader = new THREE.TextureLoader();
  return Promise.all(urls.map((url) => loader.loadAsync(url)));
};
