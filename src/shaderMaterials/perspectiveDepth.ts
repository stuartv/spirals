import * as THREE from 'three';
import vertexShader from '../shaders/perspectiveDepth.vert?raw';
import fragmentShader from '../shaders/perspectiveDepth.frag?raw';

const uniforms = {
    u_projectionMatrixInverse: {
        value: new THREE.Matrix4()
    }
};

export class PerspectiveDepthMaterial extends THREE.ShaderMaterial {
    constructor(u_projectionMatrixInverse: THREE.Matrix4) {
        super({uniforms, fragmentShader, vertexShader});

        this.uniforms.u_projectionMatrixInverse!.value = u_projectionMatrixInverse;
    }
}