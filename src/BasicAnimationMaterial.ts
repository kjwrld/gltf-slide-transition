import * as THREE from "three";
import BaseAnimationMaterial from "./BaseAnimationMaterial";

class BasicAnimationMaterial extends BaseAnimationMaterial {
  constructor(parameters: any) {
    super(parameters, THREE.ShaderLib["basic"].uniforms);

    this.lights = false;
    this.vertexShader = this.concatVertexShader();
    this.fragmentShader = this.concatFragmentShader();
  }

  concatVertexShader() {
    return THREE.ShaderLib.basic.vertexShader
      .replace(
        "void main() {",
        `
        ${this.stringifyChunk("vertexParameters")}
        ${this.stringifyChunk("varyingParameters")}
        ${this.stringifyChunk("vertexFunctions")}

        void main() {
          ${this.stringifyChunk("vertexInit")}
        `
      )
      .replace(
        "#include <beginnormal_vertex>",
        `
        #include <beginnormal_vertex>
        ${this.stringifyChunk("vertexNormal")}
        `
      )
      .replace(
        "#include <begin_vertex>",
        `
        #include <begin_vertex>
        ${this.stringifyChunk("vertexPosition")}
        ${this.stringifyChunk("vertexColor")}
        `
      )
      .replace(
        "#include <morphtarget_vertex>",
        `
        #include <morphtarget_vertex>
        ${this.stringifyChunk("vertexPostMorph")}
        `
      )
      .replace(
        "#include <skinning_vertex>",
        `
        #include <skinning_vertex>
        ${this.stringifyChunk("vertexPostSkinning")}
        `
      );
  }

  concatFragmentShader() {
    return THREE.ShaderLib.basic.fragmentShader
      .replace(
        "void main() {",
        `
        ${this.stringifyChunk("fragmentParameters")}
        ${this.stringifyChunk("varyingParameters")}
        ${this.stringifyChunk("fragmentFunctions")}

        void main() {
          ${this.stringifyChunk("fragmentInit")}
        `
      )
      .replace(
        "#include <map_fragment>",
        `
        ${this.stringifyChunk("fragmentDiffuse")}
        ${this.stringifyChunk("fragmentMap") || "#include <map_fragment>"}
        `
      );
  }
}

export { BasicAnimationMaterial };
