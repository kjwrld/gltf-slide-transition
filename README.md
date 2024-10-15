# GLTF Slide Transition

### Inspired by [Szenia Zadvornykh's Three.js Image Transition](https://codepen.io/zadvorsky/pen/PNXbGo)

The original effect is a 3D effect on 2D objects
I took this and made a shader for 3D object transitions

This implementation closely follows the original JavaScript code while adapting it to work with React and React Three Fiber. The main differences are:

1. We're using React hooks and functional components instead of classes.
2. The geometry creation is done in a `useMemo` hook to optimize performance.
3. We're using `useFrame` to update the `uTime` uniform instead of setting it manually.
4. The shader material is created using `shaderMaterial` from @react-three/drei, which simplifies the process.


