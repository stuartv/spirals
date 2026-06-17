import * as THREE from 'three';
import vertexShader from '../shaders/wideStrip.vert?raw';
import fragmentShader from '../shaders/plane.frag?raw';

const uniforms = {
    u_resolution: {
        value: new THREE.Vector2()
    }
};

export class BackgroundMaterial extends THREE.ShaderMaterial {
    constructor(u_resolution: THREE.Vector2) {
        super({
            uniforms, fragmentShader, vertexShader,
            depthWrite: false
        });
        
        this.uniforms.u_resolution!.value = u_resolution;
    }
}