import * as THREE from 'three';
import { RibbonFaceMaterial } from '../shaderMaterials/ribbonFaceMaterial';
import { RibbonEdgeMaterial } from '../shaderMaterials/ribbonEdgeMaterial';
import { Ribbon, type RibbonParams } from './ribbon';

export type AnimationInput = {
    t: number;
    i: number;
    time: number;
};

export type AnimationSetting<InParams, OutParams> = {
    [K in keyof OutParams]: (input: InParams) => OutParams[K]
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

    animate({time, timeStepDuration, animationSettings}: {
        time: number,
        timeStepDuration: number,
        animationSettings: AnimationSetting<AnimationInput, RibbonParams>
    }) {
        const rotationScale = .5;
        const stepRotation = timeStepDuration * rotationScale;
        const totalRotation = time * rotationScale;

        for (let i=0; i<this.ribbons.length; i++) {
            this.ribbons[i]?.update({
                width: (t: number) => animationSettings.width({t, i, time}),
                height: (t: number) => animationSettings.height({t, i, time}),
                r1: (t: number) => animationSettings.r1({t, i, time}),
                r2: (t: number) => animationSettings.r2({t, i, time}),
                phi: (t: number) => animationSettings.phi({t, i, time}),
                theta: (t: number) => animationSettings.theta({t, i, time}),
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
