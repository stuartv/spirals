import * as THREE from 'three';
import { RibbonFaceMaterial } from '../shaderMaterials/ribbonFaceMaterial';
import { RibbonEdgeMaterial } from '../shaderMaterials/ribbonEdgeMaterial';
import { Ribbon } from './ribbon';

export class RibbonGroup {
    private ribbons: Ribbon[];
    private group: THREE.Group;

    private ribbonFaceMaterial: RibbonFaceMaterial;
    private ribbonEdgeMaterial: RibbonEdgeMaterial;
    private ribbonWidth = .2;
    private ribbonThickness = .25;
    private revolutions = 1.5;
    private radius = 6;
    private maxTube = 2.5;
    private freq = 4;

    constructor({screenSize, numRibbons, numTicks}: {
        screenSize: THREE.Vector2,
        numRibbons: number,
        numTicks: number
    }){
        this.ribbonFaceMaterial = new RibbonFaceMaterial(screenSize);
        this.ribbonEdgeMaterial = new RibbonEdgeMaterial(screenSize);

        this.group = new THREE.Group();
        this.ribbons = [];
        for (let ribbonIdx=0; ribbonIdx<numRibbons; ribbonIdx++){
            const ribbon = new Ribbon({
                numTicks,
                ribbonFaceMaterial: this.ribbonFaceMaterial,
                ribbonEdgeMaterial: this.ribbonEdgeMaterial
            });

            this.ribbons.push(ribbon);
            this.group.add(ribbon.getGroup());
        }
    }

    getMesh(): THREE.Group {
        return this.group;
    }

    animate({time, timeStepDuration}: {
        time: number,
        timeStepDuration: number
    }) {
        const rotationScale = .5;
        const stepRotation = timeStepDuration * rotationScale;
        const totalRotation = time * rotationScale;

        for (let i=0; i<this.ribbons.length; i++) {
            this.ribbons[i]?.update({
                twist: () => 0,
                width: (t: number) => this.ribbonWidth + .2 + .2 * Math.sin(10 * time + t * 20),
                height: (t: number) => this.ribbonThickness + .05 * (1 + Math.cos(10 * time + t * 20)),
                r1: () => this.radius,
                r2: (t: number) => this.maxTube - (.35 * t * 2 * Math.PI),
                phi: (t: number) => t * this.freq * 2 * Math.PI + (i * Math.PI / 2),
                theta: (t: number) => t * 2 * Math.PI * this.revolutions
            });
        }
        
        this.getMesh().rotateZ(stepRotation);
        
        this.ribbonFaceMaterial.uniforms.u_time!.value = time;
        this.ribbonFaceMaterial.uniforms.u_normalRotation!.value = new THREE.Matrix4()
            .makeRotationZ(-totalRotation);
    
        const lightVector = new THREE.Vector3(.4, -.8, -.1).normalize()
            .applyAxisAngle(new THREE.Vector3(0,0,1), -totalRotation);
    
        this.ribbonFaceMaterial.uniforms.u_lightVec!.value = lightVector;
        this.ribbonEdgeMaterial.uniforms.u_lightVec!.value = lightVector;
    }
}
