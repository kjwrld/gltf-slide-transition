# GLTF Slide Transition

### Inspired by [Szenia Zadvornykh's Three.js Image Transition](https://codepen.io/zadvorsky/pen/PNXbGo)

The original effect is a 3D effect on 2D objects
I took this and made a shader for 3D object transitions

This implementation closely follows the original JavaScript code while adapting it to work with React and React Three Fiber. The main differences are:

- We're using React hooks and functional components instead of classes.
- The geometry creation is done in a `useMemo` hook to optimize performance.
- We're using `useFrame` to update the `uTime` uniform instead of setting it manually.
- The shader material is created using `shaderMaterial` from @react-three/drei, which simplifies the process.


## Explanation of Code Refactor

- The code creates a custom geometry for each slide, dividing it into a grid of faces.
- For each face, it calculates a centroid and sets up animation parameters (delay, duration, start position, end position, and control points for the bezier curve).

#### Material Creation:
- A custom shader material is created using THREE.BAS.BasicAnimationMaterial.
- This material extends THREE.ShaderMaterial and includes custom vertex and fragment shaders.

#### Shader Uniforms:
- The material has a 'uTime' uniform, which is used to control the animation progress.
- It also has a 'map' uniform for the slide texture.

#### Shader:
- The vertex shader uses the 'uTime' uniform along with per-vertex attributes (aAnimation, aStartPosition, aControl0, aControl1, aEndPosition) to calculate the current position of each vertex.
- It uses a cubic bezier curve interpolation for smooth movement.

#### Animation Timeline:
- A GSAP timeline is created for each slide.
- The timeline animates the 'uTime' uniform of the material from 0 to the total duration of the animation.

#### Animation Progress:
- As the timeline progresses, it updates the 'uTime' uniform.
- The vertex shader uses this 'uTime' value to calculate the current position of each vertex along its bezier curve path.
- This creates the effect of the slide pieces flying in or out.

#### Transition Phases:
- For the 'in' animation, vertices start from their offset positions and move to their original positions.
- For the 'out' animation, vertices start at their original positions and move to their offset positions.
- The main timeline is set to repeat indefinitely, alternating between the 'in' and 'out' animations of two slides.

#### Interaction:

- A tween scrubber is created, allowing manual control of the animation progress.
- A key listener is set up to pause/resume the animation.
