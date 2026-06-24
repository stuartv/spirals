import * as THREE from 'three';
import { RibbonFaceMaterial } from '../shaderMaterials/ribbonFaceMaterial';
import { RibbonEdgeMaterial } from '../shaderMaterials/ribbonEdgeMaterial';

export class RibbonGroup {
    private numRibbons: number;
    private numTicks: number;

    private geometry: THREE.Group;
    private dynamicAttributes: Float32Array[][][];
    private ribbonFaceMaterial: RibbonFaceMaterial;
    private ribbonEdgeMaterial: RibbonEdgeMaterial;
    private ribbonWidth = .2;
    private ribbonThickness = .25;
    
    private revolutions = 1.5;
    private radius = 6;
    private maxTube = 2.5;
    private freq = 4;

    private curRibbonIdx = 0;
    private curQuadStripIdx = 0;

    constructor({screenSize, numRibbons: numRibbons, numTicks}: {
        screenSize: THREE.Vector2,
        numRibbons: number,
        numTicks: number
    }){
        this.ribbonFaceMaterial = new RibbonFaceMaterial(screenSize);
        this.ribbonEdgeMaterial = new RibbonEdgeMaterial(screenSize);

        this.numRibbons = numRibbons;
        this.numTicks = numTicks;
    }

    private initGeometry() {
        const numQuadStripsInRibbon = 4;
        const numLinesInQuadStrip = 2;
        const dynamicAttributes = ['position', 'normal'];
        const elementProperties = ['x', 'y', 'z'];

        this.dynamicAttributes = Array.from({length: this.numStrips},
        () => Array.from({length: numQuadStripsInRibbon},
            () => Array.from({length: dynamicAttributes.length},
                () => new Float32Array(Array.from({length: numLinesInQuadStrip * this.numTicks * elementProperties.length},
                    () => 0)))));

        this.initGeometry();
    }

    getMesh(): THREE.Group {
        return this.geometry;
    }

    updatePoint(
        data: THREE.Vector3, // The updated data
        ribbonIdx: number, // a 3d ribbon
        quadStripIdx: number, // a 2d strip
        lineIdx: number, // edges of quad strip
        typeIdx: number, // position or normal
        tickIdx: number
    ): void {
        const vectorList: Float32Array | undefined = this.dynamicAttributes
            [ribbonIdx]?.
            [quadStripIdx]?.
            [lineIdx]?.
            [typeIdx];

        if (!vectorList){
            console.log("where's the stuff?");
            return;
        }

        vectorList.set(data.toArray(), tickIdx * 3);
    }

    buildRibbonGroup(): THREE.Group {     
        const w = this.ribbonWidth;
        const t = this.ribbonThickness;
        const stripShifts = [
            new THREE.Vector3(0, 0, 0),
            new THREE.Vector3(0, 0, w),
            new THREE.Vector3(t, 0, w),
            new THREE.Vector3(t, 0, 0)];
        
        const ribbonGroup = new THREE.Group();
        for (let ribbonIndex=0; ribbonIndex<this.numRibbons; ribbonIndex++) {
            this.curRibbonIdx = ribbonIndex;
            const phiShift = Math.PI*2 / this.numRibbons * ribbonIndex;
            for (let j=0; j<stripShifts.length; j++){
                this.curQuadStripIdx = j;
                const geometry = this.strip(
                    new THREE.Vector3(0, phiShift, 0)
                        .add(stripShifts[j]!),
                    new THREE.Vector3(0, phiShift, 0)
                        .add(stripShifts[(j+1) % stripShifts.length]!),
                    j == 0
                    );

                let material;
                if (j % 2 == 0) {
                    material = this.ribbonFaceMaterial;
                    geometry.computeVertexNormals();
                } else {
                    material = this.ribbonEdgeMaterial;
                }

                ribbonGroup.add(new THREE.Mesh(geometry, material));
            }
        }
        return ribbonGroup;
    }

    animate({
        time,
        timeStepDuration
    }:{
        time: number,
        timeStepDuration: number
    }) {
        const rotationScale = .5;
        const stepRotation = timeStepDuration * rotationScale;
        const totalRotation = time * rotationScale;
    
        this.getMesh().rotateZ(stepRotation);
        
        this.ribbonFaceMaterial.uniforms.u_time!.value = time;
        this.ribbonFaceMaterial.uniforms.u_normalRotation!.value = new THREE.Matrix4()
            .makeRotationZ(-totalRotation);
    
        const lightVector = new THREE.Vector3(.4, -.8, -.1).normalize()
            .applyAxisAngle(new THREE.Vector3(0,0,1), -totalRotation);
    
        this.ribbonFaceMaterial.uniforms.u_lightVec!.value = lightVector;
        this.ribbonEdgeMaterial.uniforms.u_lightVec!.value = lightVector;
    }

    private quadStrip(
        points: THREE.Vector3[],
        normals: THREE.Vector3[]
    ): THREE.BufferGeometry {
        const geometry = new THREE.BufferGeometry();
        const positionElementSize = 3;
        const normalElementSize = 3;
        const uvElementSize = 2;

        /*
            updatePoint(
            stripIdx: number, // a 3d strip
            quadStripIdx: number, // a 2d strip
            lineIdx: number, // edges of quad strip
            typeIdx: number, // position or normal
            tickIdx: number
        */



        this.dynamicAttributes[this.curRibbonIdx][this.curQuadStripIdx][0]

        const mesh = this.geometry?.children[this.curRibbonIdx * 4 + this.curQuadStripIdx];
        
        if(!geometry.getAttribute('position')){
            geometry.setAttribute('position',
            new THREE.BufferAttribute(
                new Float32Array(
                    points.flatMap(point => point.toArray())),
                    positionElementSize)
                    .setUsage(THREE.DynamicDrawUsage));
        } else {

        }

        

        geometry.setAttribute('normal',
            new THREE.BufferAttribute(
                new Float32Array(
                    normals.flatMap(normal => normal.toArray())),
                    normalElementSize
                ).setUsage(THREE.DynamicDrawUsage));

        // Return here if this is just an update.
        if (geometry.getAttribute('uv')){
            return geometry;
        }

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
        flipNormal: boolean
    ): THREE.BufferGeometry {
        const tubeShift = flipNormal
            ? new THREE.Vector3(-1, 0, 0)
            : new THREE.Vector3(1, 0, 0);

        const points: THREE.Vector3[] = [];
        const normals: THREE.Vector3[] = [];
        const totalAngle = Math.PI*2 * this.revolutions;

        for (let bigI=0; bigI<this.numTicks; bigI++){
            const i = -.2 + bigI / this.numTicks * totalAngle;

            const pt1 = this.spiralPoint(i, new THREE.Vector3(
                shift1.x * (1 - i / totalAngle),
                shift1.y,
                shift1.z
            ));
            const pt2 = this.spiralPoint(i, new THREE.Vector3(
                shift2.x * (1 - i / totalAngle),
                shift2.y,
                shift2.z
            ));

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
                Math.max(0, theta + thetaShift));
    }
}
