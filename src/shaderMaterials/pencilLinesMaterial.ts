import * as THREE from 'three';
import fragmentShader from '../shaders/pencilLines.frag?raw';
import vertexShader from '../shaders/pencilLines.vert?raw';

const uniforms = {
    tDiffuse: { value: null},
    uResolution: { value: new THREE.Vector2(1, 1)},
    uNormals: {value: new THREE.Vector3(1, 1, 1)}
};

export class PencilLinesMaterial extends THREE.ShaderMaterial {
    constructor() {
        super({uniforms, fragmentShader, vertexShader});
    }
}