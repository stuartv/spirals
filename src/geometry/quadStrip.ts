import * as THREE from 'three';

export class QuadStrip {
    private numTicks: number;
    private bufferGeometry: THREE.BufferGeometry;
    private positions!: Float32Array;

    constructor(numTicks: number) {
        this.numTicks = numTicks;
        this.bufferGeometry = this.genQuadStrip();
    }

    getPositions(): Float32Array {
        return this.positions;
    }

    getBufferGeometry(): THREE.BufferGeometry {
        return this.bufferGeometry;
    }

    private genIndexes(): number[] {
        const numQuads = this.numTicks - 1;
        const indexes: number[] = [];
        for (let i=0; i<numQuads*2; i+=2) {
            indexes.push(
                i+0, i+2, i+1,
                i+1, i+2, i+3);
        }
        return indexes;
    }
    
    private genUvs(): THREE.BufferAttribute {
        const uvElementSize = 2;
        return new THREE.BufferAttribute(
            new Float32Array(
                Array(2 * this.numTicks).fill(0).flatMap((_, i) => 
                [
                    i % 2,
                    Math.floor(i / 2) / (this.numTicks / 2)
                ])),
            uvElementSize)
    }

    private genPositions(): THREE.BufferAttribute {
        const positionElementSize = 3;
        this.positions = new Float32Array(
            Array(2 * this.numTicks * positionElementSize).fill(0));

        return new THREE.BufferAttribute(this.positions, positionElementSize);
    }

    private genQuadStrip(): THREE.BufferGeometry {
        const geometry = new THREE.BufferGeometry();
        geometry.setAttribute('position',
            this.genPositions()
                .setUsage(THREE.DynamicDrawUsage));
        geometry.computeVertexNormals();
        geometry.setAttribute('uv', this.genUvs());
        geometry.setIndex(this.genIndexes());
        return geometry;
    }
};