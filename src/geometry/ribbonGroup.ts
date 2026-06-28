import * as THREE from 'three';
import { RibbonFaceMaterial } from '../shaderMaterials/ribbonFaceMaterial';
import { RibbonEdgeMaterial } from '../shaderMaterials/ribbonEdgeMaterial';
import { Ribbon } from './ribbon';

type AnimationInput = {
    t: number;
    i: number;
    time: number;
};

type RibbonParams = {
    width: number;
    height: number;
    r1: number;
    r2: number;
    phi: number;
    theta: number;
}

type AnimationSetting<InParams, OutParams> = {
    [K in keyof OutParams]: (input: InParams) => OutParams[K]
}

const mySetting: AnimationSetting<AnimationInput, RibbonParams> = {
    width: ({t, time}) =>  .4 + .2 * Math.sin(10 * time + t * 20),
    height: ({t, time}) => .25 + .05 * (1 + Math.cos(10 * time + t * 20)),
    r1: ({}) => 6,
    r2: ({t}) => 2.5 - (.35 * t * 2 * Math.PI),
    phi: ({t, i}) => t * 4 * 2 * Math.PI + (i * Math.PI / 2),
    theta: ({t}) => t * 2 * Math.PI * 1.5
}

export class RibbonGroup {
    private ribbons: Ribbon[];
    private group: THREE.Group;

    private ribbonFaceMaterial: RibbonFaceMaterial;
    private ribbonEdgeMaterial: RibbonEdgeMaterial;

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
                width: (t: number) =>  .4 + .2 * Math.sin(10 * time + t * 20),
                height: (t: number) => .25 + .05 * (1 + Math.cos(10 * time + t * 20)),
                r1: (t: number) => 6,
                r2: (t: number) => 2.5 - (.35 * t * 2 * Math.PI),
                phi: (t: number) => t * 4 * 2 * Math.PI + (i * Math.PI / 2),
                theta: (t: number) => t * 2 * Math.PI * 1.5
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
