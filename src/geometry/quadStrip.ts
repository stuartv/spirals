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
                Array(numTicks).fill(0).flatMap((_, i) => 
                [
                    i % 2,
                    Math.floor(i / 2) / (numTicks / 2)
                ])),
            uvElementSize)
    }

    private genPositions(numTicks: number): THREE.BufferAttribute {
        this.positions = new Float32Array(
            Array(numTicks).fill(0).flatMap(
                () => Array(positionElementSize).fill(0)));

        const positionElementSize = 3;
        return new THREE.BufferAttribute(this.positions, positionElementSize);
    }
    
    // TODO: Use the autogen feature instead?
    private genNormals(numTicks: number): THREE.BufferAttribute {
        const normalElementSize = 3;
        return new THREE.BufferAttribute(
            new Float32Array(
                Array(numTicks).fill(0).flatMap(
                    () => Array(normalElementSize).fill(0)
                )
            ),
            normalElementSize
        );
    }

    private genQuadStrip(numTicks: number): THREE.BufferGeometry {
        return new THREE.BufferGeometry()
            .setAttribute('position', this.genPositions(numTicks)
            .setUsage(THREE.DynamicDrawUsage)
        )
            .setAttribute('normal', this.genNormals(numTicks)
            .setUsage(THREE.DynamicDrawUsage)
        )
            .setAttribute('uv', this.genUvs(numTicks)
        )
            .setIndex(this.genIndexes(numTicks));
    }
};