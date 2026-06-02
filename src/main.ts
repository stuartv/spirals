import * as THREE from 'three';

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(
    75,
    window.innerWidth / window.innerHeight,
    0.1,
    1000);

const renderer = new THREE.WebGLRenderer();
renderer.setSize(
    window.innerWidth,
    window.innerHeight);

document.body.appendChild( renderer.domElement );

function quadStrip(
    points: THREE.Vector3[]
): THREE.BufferGeometry {
    const geometry = new THREE.BufferGeometry();
    const numbersPerElement = 3;

    geometry.setAttribute('position',
        new THREE.BufferAttribute(
            new Float32Array(points.flatMap(point => point.toArray())),
            numbersPerElement));

    const numQuads = (points.length / 2) - 1;
    const indexes: number[] = [];
    for (let i=0; i<numQuads*2; i+=2) {
        indexes.push(
            i+0, i+2, i+1,
            i+1, i+2, i+3);
    }
    geometry.setIndex(indexes);

    geometry.computeVertexNormals();

    return geometry;
}

function strip(
    shift1: THREE.Vector3,
    shift2: THREE.Vector3,
): THREE.BufferGeometry {
    const points = [];
    for (let i=0; i<Math.PI*3; i+=.1) {
        const pt1 = spiralPoint(i, shift1)
        const pt2 = spiralPoint(i, shift2);
        points.push(pt1);
        points.push(pt2);
    }

    return quadStrip(points);
}

function spiralPoint(
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

const stripGroup = new THREE.Group();

const stripWidth = .2;
const stripThickness = .4;
const stripShifts = [
    new THREE.Vector3(             0, 0,          0),
    new THREE.Vector3(             0, 0, stripWidth),
    new THREE.Vector3(stripThickness, 0, stripWidth),
    new THREE.Vector3(stripThickness, 0,          0)
];

const numStrips = 4;
for (let stripIndex=0; stripIndex<numStrips; stripIndex++) {
    const phiShift = Math.PI*2 / numStrips * stripIndex;
    for (let j=0; j<stripShifts.length; j++){
        stripGroup.add(new THREE.Mesh(
            strip(
                new THREE.Vector3(0, phiShift, 0)
                    .add(stripShifts[j]!),
                new THREE.Vector3(0, phiShift, 0)
                    .add(stripShifts[(j+1) % stripShifts.length]!)),
            new THREE.MeshNormalMaterial()));
    }
}

scene.add(stripGroup);

camera.position.z = 15;

function animate(time: number) {
    stripGroup.rotation.x = time / 2000;
    stripGroup.rotation.y = time / 1000;
    
    renderer.render(scene, camera);
}

renderer.setAnimationLoop(animate);

    