import * as THREE from 'three';
import fragmentShader from '../shaders/pencilLines.frag?raw';
import vertexShader from '../shaders/pencilLines.vert?raw';

export class PencilLinesMaterial extends THREE.ShaderMaterial {
    constructor() {
        super({
            uniforms: {
                tDiffuse: {
                    value: null
                },
                uResolution: {
                    value: null
                }
            },
            fragmentShader,
            vertexShader
        });
    }
}