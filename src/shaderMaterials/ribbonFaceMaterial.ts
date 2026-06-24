import * as THREE from 'three';
import fragmentShader from '../shaders/ribbonFace.frag?raw';
import vertexShader from '../shaders/ribbonFace.vert?raw';

const uniforms = {
    u_resolution: {
        value: new THREE.Vector2()
    },
    u_time: {
        value: 0.0
    },
    u_normalRotation: {
        value: new THREE.Matrix4()
    },
    u_uvShift: {
        value: new THREE.Vector2()
    },
    u_lightVec: {
        value: new THREE.Vector3()
    }
};

export class WideStripMaterial extends THREE.ShaderMaterial {
    constructor(u_resolution: THREE.Vector2) {
        super({uniforms, fragmentShader, vertexShader});
        
        this.uniforms.u_resolution!.value = u_resolution;
    }
}