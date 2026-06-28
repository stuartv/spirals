import * as THREE from 'three';
import { QuadStrip } from './quadStrip';
import { RibbonFaceMaterial } from '../shaderMaterials/ribbonFaceMaterial';
import { RibbonEdgeMaterial } from '../shaderMaterials/ribbonEdgeMaterial';

export class Ribbon {
    private numTicks: number;
    private group: THREE.Group;
    private quadStrips: QuadStrip[];

    constructor({numTicks, ribbonFaceMaterial, ribbonEdgeMaterial}:{
        numTicks: number,
        ribbonFaceMaterial: RibbonFaceMaterial,
        ribbonEdgeMaterial: RibbonEdgeMaterial,
    }) {
        this.numTicks = numTicks;
        this.quadStrips = [];
        this.group = new THREE.Group();

        const numQuadStripsInRibbon = 4;

        // TODO: Am I reusing the quadStrip reference or creating a new one?
        for (let quadIdx=0; quadIdx<numQuadStripsInRibbon; quadIdx++){
            const quadStrip = new QuadStrip(numTicks);

            this.quadStrips.push(quadStrip);
            this.group.add(new THREE.Mesh(
                quadStrip.getBufferGeometry(),
                quadIdx % 2 == 0
                  ? ribbonEdgeMaterial
                  : ribbonFaceMaterial
            ));
        }
    }

    getGroup(): THREE.Group {
        return this.group;
    }

    update({width, height, r1, r2, phi, theta}:{
        width: (t: number) => number,
        height: (t: number) => number,
        r1: (t: number) => number,
        r2: (t: number) => number,
        phi: (t: number) => number,
        theta: (t: number) => number
    }): void {
        for (let tick=0; tick<this.numTicks; tick++){
            const t = tick / this.numTicks;
            this.updateTick(tick, {
                width: width(t),
                height: height(t),
                r1: r1(t),
                r2: r2(t),
                phi: phi(t),
                theta: theta(t)});
        }

        this.quadStrips.forEach(quadStrip => {
            quadStrip.getBufferGeometry().getAttribute('position').needsUpdate = true;
            quadStrip.getBufferGeometry().getAttribute('normal').needsUpdate = true;
        });
    }

    private updateTick(tick: number, {width, height, r1, r2, phi, theta}:{
        width: number,
        height: number,
        r1: number,
        r2: number,
        phi: number,
        theta: number
    }): void {
        const w = width / 2;
        const h = height / 2;
        const points: THREE.Vector3[] = [
            this.toroidalToCartesian({r1, r2: r2 - w, phi, theta: theta + h}),
            this.toroidalToCartesian({r1, r2: r2 + w, phi, theta: theta + h}),
            this.toroidalToCartesian({r1, r2: r2 + w, phi, theta: theta - h}),
            this.toroidalToCartesian({r1, r2: r2 - w, phi, theta: theta - h}),
        ];

        const elementSize = 3;
        const numStrips = 4;
        for (let i=0; i<numStrips; i++) {
            this.quadStrips[i]?.getPositions()
                .set([
                    ...points[(i + 0) % numStrips]!.toArray(),
                    ...points[(i + 1) % numStrips]!.toArray()],
                    2 * elementSize * tick);
            
            // TOOD: Modulo logic breaks when numStrips != 4
            this.quadStrips[i]?.getNormals()
                .set([
                    ...points[(i + 0) % numStrips]!.clone().sub(
                        points[(i + 3) % numStrips]!
                    ).normalize(),
                    ...points[(i + 1) % numStrips]!.clone().sub(
                        points[(i + 2) % numStrips]!
                    ).normalize()],
                    2 * elementSize * tick);
        }
    }

    private toroidalToCartesian({r1, r2, phi, theta}:{
        r1: number,
        r2: number,
        phi: number,
        theta: number
    }): THREE.Vector3 {
        const xAxis = new THREE.Vector3(1, 0, 0);
        const zAxis = new THREE.Vector3(0, 0, 1);

        return new THREE.Vector3(r2, 0, 0)
            .applyAxisAngle(zAxis, phi)
            .applyAxisAngle(xAxis, Math.PI / 2)
            .add(new THREE.Vector3(r1, 0, 0))
            .applyAxisAngle(zAxis, theta);
    }
};