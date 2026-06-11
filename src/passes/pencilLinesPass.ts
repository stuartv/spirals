import {Pass, FullScreenQuad} from 'three/examples/jsm/postprocessing/Pass.js';
import * as THREE from 'three';
import { PencilLinesMaterial } from '../shaderMaterials/pencilLinesMaterial';

export class PencilLinesPass extends Pass {
    fsQuad: FullScreenQuad;
    material: PencilLinesMaterial;
    normalBuffer: THREE.WebGLRenderTarget;
    normalMaterial: THREE.MeshNormalMaterial;
    scene: THREE.Scene;
    camera: THREE.Camera;

    constructor({
        width,
        height,
        scene,
        camera
    }: {
        width: number;
        height: number;
        scene: THREE.Scene;
        camera: THREE.Camera
    }) {
        super();
        this.scene = scene;
        this.camera = camera

        this.normalBuffer = new THREE.WebGLRenderTarget(
            width,
            height,
            {
                format: THREE.RGBAFormat,
                type: THREE.HalfFloatType,
                minFilter: THREE.NearestFilter,
                magFilter: THREE.NearestFilter,
                generateMipmaps: false,
                stencilBuffer: false,
            });
        this.normalMaterial = new THREE.MeshNormalMaterial()

        this.material = new PencilLinesMaterial;
        this.fsQuad = new FullScreenQuad(this.material);

        this.material.uniforms.uResolution!.value = new THREE.Vector2(width, height);
    }

    render(
        renderer: THREE.WebGLRenderer,
        writeBuffer: THREE.WebGLRenderTarget,
        readBuffer: THREE.WebGLRenderTarget
    ) {
        renderer.setRenderTarget(this.normalBuffer)
        const overrideMaterialValue = this.scene.overrideMaterial

        this.scene.overrideMaterial = this.normalMaterial
        renderer.render(this.scene, this.camera)
        this.scene.overrideMaterial = overrideMaterialValue

        this.material.uniforms.uNormals!.value = this.normalBuffer.texture
        this.material.uniforms.tDiffuse!.value = readBuffer.texture

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