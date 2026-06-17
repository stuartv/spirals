import * as THREE from 'three';
import { WideStripMaterial } from '../shaderMaterials/wideStripMaterial';
import { ThinStripMaterial } from '../shaderMaterials/thinStripMaterial';

export class StripGroup {
    private screenSize: THREE.Vector2;
    private geometry?: THREE.Group;
    wideStripMaterial: WideStripMaterial;
    thinStripMaterial: ThinStripMaterial;

    constructor(
        screenSize: THREE.Vector2
    ){
        this.screenSize = screenSize;
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
        const stripGroup = new THREE.Group();

        const stripWidth = .2;
        const stripThickness = .4;
        const stripShifts = [
            new THREE.Vector3(             0, 0,          0),
            new THREE.Vector3(             0, 0, stripWidth),
            new THREE.Vector3(stripThickness, 0, stripWidth),
            new THREE.Vector3(stripThickness, 0,          0)
        ];

        const wideStripMaterial = new WideStripMaterial(this.screenSize);
        const thinStripMaterial = new ThinStripMaterial(this.screenSize);
        const stripMaterials = [
            wideStripMaterial,
            thinStripMaterial,
            wideStripMaterial,
            thinStripMaterial
        ]

        const numStrips = 4;
        for (let stripIndex=0; stripIndex<numStrips; stripIndex++) {
            const phiShift = Math.PI*2 / numStrips * stripIndex;
            for (let j=0; j<stripShifts.length; j++){
                stripGroup.add(new THREE.Mesh(
                    this.strip(
                        new THREE.Vector3(0, phiShift, 0)
                            .add(stripShifts[j]!),
                        new THREE.Vector3(0, phiShift, 0)
                            .add(stripShifts[(j+1) % stripShifts.length]!)),
                    stripMaterials[j]));
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
        const revolutions = 1.5;
        const fidelity = .001;

        const tubeShift = new THREE.Vector3(1, 0, 0);

        const points = [];
        const normals: THREE.Vector3[] = [];
        for (let i=0; i<Math.PI*2 * revolutions; i+=fidelity) {
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
        const radius = 5;
        const maxTube = 3;
        const freq = 4;

        // shrink factor
        const tube = maxTube - (.35 * theta);

        const tubeShift = shift.x;
        const phiShift = shift.y;
        const thetaShift = shift.z;

        const xAxis = new THREE.Vector3(1, 0, 0);
        const zAxis = new THREE.Vector3(0, 0, 1);

        return new THREE.Vector3(tube + tubeShift, 0, 0)
            .applyAxisAngle(
                zAxis,
                (theta * freq) + phiShift)
            .applyAxisAngle(
                xAxis,
                Math.PI / 2)
            .add(
                new THREE.Vector3(radius, 0, 0))
            .applyAxisAngle(
                zAxis,
                theta + thetaShift);
    }
}
