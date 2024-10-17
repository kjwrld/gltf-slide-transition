import * as THREE from "three";

class BaseAnimationMaterial extends THREE.ShaderMaterial {
  constructor(
    parameters: any,
    uniforms: THREE.UniformsGroup | { [uniform: string]: THREE.IUniform }
  ) {
    super();

    if (parameters.uniformValues) {
      console.warn(
        "THREE.BAS - `uniformValues` is deprecated. Put their values directly into the parameters."
      );

      Object.keys(parameters.uniformValues).forEach((key) => {
        parameters[key] = (parameters.uniformValues as any)[key];
      });

      delete parameters.uniformValues;
    }

    // copy parameters to (1) make use of internal #define generation
    // and (2) prevent 'x is not a property of this material' warnings.
    Object.keys(parameters).forEach((key) => {
      (this as any)[key] = parameters[key];
    });

    // override default parameter values
    this.setValues(parameters);

    // override uniforms
    this.uniforms = THREE.UniformsUtils.merge([
      uniforms,
      parameters.uniforms || {},
    ]);

    // set uniform values from parameters that affect uniforms
    this.setUniformValues(parameters);
  }

  setUniformValues(values: any) {
    if (!values) return;

    const keys = Object.keys(values);

    keys.forEach((key) => {
      if (key in this.uniforms) {
        this.uniforms[key].value = values[key];
      }
    });
  }

  stringifyChunk(name: string) {
    let value;

    if (!(this as any)[name]) {
      value = "";
    } else if (typeof (this as any)[name] === "string") {
      value = (this as any)[name];
    } else {
      value = ((this as any)[name] as string[]).join("\n");
    }

    return value;
  }
}

export default BaseAnimationMaterial;
