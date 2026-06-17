import * as THREE from 'three';
import { WideStripMaterial } from '../shaderMaterials/wideStripMaterial';
import { ThinStripMaterial } from '../shaderMaterials/thinStripMaterial';

export class StripGroup {
    private geometry?: THREE.Group;
    wideStripMaterial: WideStripMaterial;
    thinStripMaterial: ThinStripMaterial;
    private stripWidth = .2;
    private stripThickness = .4;
    private numStrips = 4;
    private revolutions = 1.5;
    private fidelity = .001;
    private radius = 5;
    private maxTube = 3;
    private freq = 4;


    constructor(
        screenSize: THREE.Vector2
    ){
        this.wideStripMaterial = new WideStripMaterial(screenSize);
        this.thinStripMaterial = new ThinStripMaterial(screenSize);
    }

    getGeometry(): THREE.Group {
        if (!this.geometry){
            this.geometry = this.buildStripGroup();
        }
        return this.geometry;
    }

    buildStripGroup(): THREE.Group {
        const w = this.stripWidth;
        const t = this.stripThickness;
        const stripShifts = [
            new THREE.Vector3(0, 0, 0),
            new THREE.Vector3(0, 0, w),
            new THREE.Vector3(t, 0, w),
            new THREE.Vector3(t, 0, 0)];

        const stripGroup = new THREE.Group();
        for (let stripIndex=0; stripIndex<this.numStrips; stripIndex++) {
            const phiShift = Math.PI*2 / this.numStrips * stripIndex;
            for (let j=0; j<stripShifts.length; j++){
                const geometry = this.strip(
                    new THREE.Vector3(0, phiShift, 0)
                        .add(stripShifts[j]!),
                    new THREE.Vector3(0, phiShift, 0)
                        .add(stripShifts[(j+1) % stripShifts.length]!));

                const material = j % 2 == 0
                    ? this.wideStripMaterial
                    : this.thinStripMaterial;

                stripGroup.add(new THREE.Mesh(geometry, material));
            }
        }
        return stripGroup;
    }

    private quadStrip(
        points: THREE.Vector3[],
        normals: THREE.Vector3[]
    ): THREE.BufferGeometry {
        const geometry = new THREE.BufferGeometry();
        const positionElementSize = 3;
        const normalElementSize = 3;
        const uvElementSize = 2;

        geometry.setAttribute('position',
            new THREE.BufferAttribute(
                new Float32Array(points.flatMap(point => point.toArray())),
                positionElementSize));

        geometry.setAttribute('normal',
            new THREE.BufferAttribute(
                new Float32Array(normals.flatMap(normal => normal.toArray())),
                normalElementSize));

        geometry.setAttribute('uv',
            new THREE.BufferAttribute(
                new Float32Array(points.flatMap((point, i) => 
                    [
                        i % 2,
                        Math.floor(i / 2) / (points.length / 2)
                    ])),
                uvElementSize));

        const numQuads = (points.length / 2) - 1;
        const indexes: number[] = [];
        for (let i=0; i<numQuads*2; i+=2) {
            indexes.push(
                i+0, i+2, i+1,
                i+1, i+2, i+3);
        }
        geometry.setIndex(indexes);

        return geometry;
    }

    private strip(
        shift1: THREE.Vector3,
        shift2: THREE.Vector3,
    ): THREE.BufferGeometry {
        

        const tubeShift = new THREE.Vector3(1, 0, 0);

        const points = [];
        const normals: THREE.Vector3[] = [];
        for (let i=0; i<Math.PI*2 * this.revolutions; i+=this.fidelity) {
            const pt1 = this.spiralPoint(i, shift1)
            const pt2 = this.spiralPoint(i, shift2);
            points.push(pt1);
            points.push(pt2);

            normals.push(this.spiralPoint(i, shift1.clone().add(tubeShift)).sub(pt1));
            normals.push(this.spiralPoint(i, shift2.clone().add(tubeShift)).sub(pt2));
        }

        return this.quadStrip(points, normals);
    }

    private spiralPoint(
        theta: number,
        shift: THREE.Vector3 = new THREE.Vector3()
    ): THREE.Vector3 {
        // shrink factor
        const tube = this.maxTube - (.35 * theta);

        const tubeShift = shift.x;
        const phiShift = shift.y;
        const thetaShift = shift.z;

        const xAxis = new THREE.Vector3(1, 0, 0);
        const zAxis = new THREE.Vector3(0, 0, 1);

        return new THREE.Vector3(tube + tubeShift, 0, 0)
            .applyAxisAngle(
                zAxis,
                (theta * this.freq) + phiShift)
            .applyAxisAngle(
                xAxis,
                Math.PI / 2)
            .add(
                new THREE.Vector3(this.radius, 0, 0))
            .applyAxisAngle(
                zAxis,
                theta + thetaShift);
    }
}
