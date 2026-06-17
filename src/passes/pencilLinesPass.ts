import {Pass, FullScreenQuad} from 'three/examples/jsm/postprocessing/Pass.js';
import * as THREE from 'three';
import { PencilLinesMaterial } from '../shaderMaterials/pencilLinesMaterial';
import { PerspectiveDepthMaterial } from '../shaderMaterials/perspectiveDepth';

export class PencilLinesPass extends Pass {
    fsQuad: FullScreenQuad;
    material: PencilLinesMaterial;
    normalBuffer: THREE.WebGLRenderTarget;
    normalMaterial: THREE.MeshNormalMaterial;
    depthBuffer: THREE.WebGLRenderTarget;
    depthMaterial: PerspectiveDepthMaterial;
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
                stencilBuffer: false
            });
        this.normalMaterial = new THREE.MeshNormalMaterial()

        this.depthBuffer = new THREE.WebGLRenderTarget(
            width,
            height,
            {
                format: THREE.RGBAFormat,
                type: THREE.HalfFloatType,
                minFilter: THREE.NearestFilter,
                magFilter: THREE.NearestFilter,
                generateMipmaps: false,
                stencilBuffer: false
            });
        this.depthMaterial = new PerspectiveDepthMaterial(camera.projectionMatrixInverse);
            
        this.material = new PencilLinesMaterial;
        this.fsQuad = new FullScreenQuad(this.material);

        this.material.uniforms.u_resolution!.value = new THREE.Vector2(width, height);
    }

    render(
        renderer: THREE.WebGLRenderer,
        writeBuffer: THREE.WebGLRenderTarget,
        readBuffer: THREE.WebGLRenderTarget
    ) {
        const overrideMaterialValue = this.scene.overrideMaterial

        // Normals
        renderer.setRenderTarget(this.normalBuffer)
        this.scene.overrideMaterial = this.normalMaterial
        renderer.render(this.scene, this.camera)
        
        // Depth
        renderer.setRenderTarget(this.depthBuffer)
        this.scene.overrideMaterial = this.depthMaterial
        renderer.render(this.scene, this.camera)

        this.scene.overrideMaterial = overrideMaterialValue

        this.material.uniforms.uNormals!.value = this.normalBuffer.texture
        this.material.uniforms.tDepth!.value = this.depthBuffer.texture
        this.material.uniforms.tDiffuse!.value = readBuffer.texture        

        if (this.renderToScreen) {
            renderer.setRenderTarget(null);
        } else {
            renderer.setRenderTarget(writeBuffer);
            if (this.clear) {
                renderer.clear();
            }
        }

        this.fsQuad.render(renderer);
    }
}