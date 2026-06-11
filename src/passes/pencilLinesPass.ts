import {Pass, FullScreenQuad} from 'three/examples/jsm/postprocessing/Pass.js';
import * as THREE from 'three';
import { PencilLinesMaterial } from '../shaderMaterials/pencilLinesMaterial';

export class PencilLinesPass extends Pass {
    fsQuad: FullScreenQuad;
    material: PencilLinesMaterial;

    constructor({
        width,
        height
    }: {
        width: number;
        height: number
    }) {
        super();

        this.material = new PencilLinesMaterial;
        this.fsQuad = new FullScreenQuad(this.material);

        this.material.uniforms.uResolution!.value = new THREE.Vector2(width, height);
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