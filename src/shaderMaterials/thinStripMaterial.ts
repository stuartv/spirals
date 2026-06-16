import * as THREE from 'three';
import fragmentShader from '../shaders/thinStrip.frag?raw';
import vertexShader from '../shaders/thinStrip.vert?raw';

const uniforms = {
    u_resolution: {
        value: new THREE.Vector2()
    },
    u_lightVec: {
        value: new THREE.Vector3()
    }
};

export class ThinStripMaterial extends THREE.ShaderMaterial {
    constructor(u_resolution: THREE.Vector2) {
        super({uniforms, fragmentShader, vertexShader});
        
        this.uniforms.u_resolution!.value = u_resolution;
    }
}