import * as THREE from 'three';

export class QuadStrip {
    private numTicks: number;
    private bufferGeometry: THREE.BufferGeometry;
    private positions!: Float32Array;

    constructor(numTicks: number) {
        this.numTicks = numTicks;
        this.bufferGeometry = this.genQuadStrip(numTicks);
    }

    getPositions(): Float32Array {
        return this.positions;
    }

    getBufferGeometry(): THREE.BufferGeometry {
        return this.bufferGeometry;
    }

    private genIndexes(numTicks: number): number[] {
        const numQuads = numTicks - 1;
        const indexes: number[] = [];
        for (let i=0; i<numQuads*2; i+=2) {
            indexes.push(
                i+0, i+2, i+1,
                i+1, i+2, i+3);
        }
        return indexes;
    }
    
    private genUvs(numTicks: number): THREE.BufferAttribute {
        const uvElementSize = 2;
        return new THREE.BufferAttribute(
            new Float32Array(
                Array(2 * numTicks).fill(0).flatMap((_, i) => 
                [
                    i % 2,
                    Math.floor(i / 2) / (numTicks / 2)
                ])),
            uvElementSize)
    }

    private genPositions(numTicks: number): THREE.BufferAttribute {
        const positionElementSize = 3;
        this.positions = new Float32Array(
            Array(numTicks).fill(0).flatMap(
                () => Array(2 * positionElementSize).fill(0)));

        return new THREE.BufferAttribute(this.positions, positionElementSize);
    }
    
    // TODO: Use the autogen feature instead?
    private genNormals(numTicks: number): THREE.BufferAttribute {
        const normalElementSize = 3;
        return new THREE.BufferAttribute(
            new Float32Array(
                Array(numTicks).fill(0).flatMap(
                    () => Array(2 * normalElementSize).fill(0)
                )
            ),
            normalElementSize
        );
    }

    private genQuadStrip(numTicks: number): THREE.BufferGeometry {
        const geometry = new THREE.BufferGeometry();

        geometry.setAttribute('position',
            this.genPositions(numTicks)
                .setUsage(THREE.DynamicDrawUsage));

        geometry.computeVertexNormals();
        
        geometry.setAttribute('uv', this.genUvs(numTicks));

        geometry.setIndex(this.genIndexes(numTicks));

        return geometry;
    }
};