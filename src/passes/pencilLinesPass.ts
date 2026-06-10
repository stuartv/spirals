import {Pass, FullScreenQuad} from 'three/examples/jsm/postprocessing/Pass.js';
import * as THREE from 'three';
import { CopyShader } from 'three/examples/jsm/shaders/CopyShader.js';

export class PencilLinesPass extends Pass {
    fsQuad: FullScreenQuad;
    material: THREE.ShaderMaterial;

    constructor() {
        super()

        this.material = new THREE.ShaderMaterial(CopyShader);
        this.fsQuad = new FullScreenQuad(this.material);
    }

    render(
        renderer: THREE.WebGLRenderer,
        writeBuffer: THREE.WebGLRenderTarget,
        readBuffer: THREE.WebGLRenderTarget
    ) {
        this.material.uniforms['tDiffuse']!.value = readBuffer.texture;

        if (this.renderToScreen) {
            renderer.setRenderTarget(null);
            this.fsQuad.render(renderer);
        } else {
            renderer.setRenderTarget(writeBuffer);
            if (this.clear) {
                renderer.clear();
            }
            this.fsQuad.render(renderer);
        }
    }
}