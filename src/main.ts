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

const lineMaterial = new THREE.LineBasicMaterial({
    color: new THREE.Color(255,0,0)
});

function quadStrip(
    points: THREE.Vector3[],
    normals: THREE.Vector3[]
): THREE.BufferGeometry {
    const geometry = new THREE.BufferGeometry();
    const numbersPerElement = 3;

    geometry.setAttribute('position',
        new THREE.BufferAttribute(
            new Float32Array(points.flatMap(point => point.toArray())),
            numbersPerElement));

    geometry.setAttribute('normal',
        new THREE.BufferAttribute(
            new Float32Array(normals.flatMap(normal => normal.toArray())),
            numbersPerElement));

    const numQuads = (points.length / 2) - 1;
    const indexes: number[] = [];
    for (let i=0; i<numQuads; i++) {
        indexes.push(
            i+0, i+2, i+1,
            i+1, i+2, i+3);
    }
    geometry.setIndex(indexes);

    return geometry;
}

function stripTop(): THREE.BufferGeometry {
    const shift1 = new THREE.Vector3(0, 0, 0);
    const shift2 = new THREE.Vector3(0, 0, .2);

    const tubeShift = new THREE.Vector3(1, 0, 0);

    const points = [];
    const normals: THREE.Vector3[] = [];
    for (let i=0; i<6; i+=.01) {
        const pt1 = spiralPoint(i, shift1)
        const pt2 = spiralPoint(i, shift2);
        points.push(pt1);
        points.push(pt2);

        normals.push(spiralPoint(i, shift1.clone().add(tubeShift)).sub(pt1));
        normals.push(spiralPoint(i, shift2.clone().add(tubeShift)).sub(pt2));
    }

    return quadStrip(points, normals);
}

function spiralLineGeometry(
    shift: THREE.Vector3 = new THREE.Vector3()
) {
    const points = [];
    for (let i=0; i<6; i+=.01) {
        points.push(spiralPoint(i, shift));
    }

    return new THREE.BufferGeometry()
        .setFromPoints(points);
}

function spiralPoint(
    theta: number,
    shift: THREE.Vector3 = new THREE.Vector3()
): THREE.Vector3 {
    const radius = 5;
    const tube = 1;
    const freq = 5;

    const tubeShift = shift.x;
    const phiShift = shift.y;
    const thetaShift = shift.z;

    return new THREE.Vector3(tube + tubeShift, 0, 0)
        .applyAxisAngle(
            new THREE.Vector3(0, 0, 1),
            (theta * freq) + phiShift)
        .applyAxisAngle(
            new THREE.Vector3(1, 0, 0),
            Math.PI / 2)
        .add(
            new THREE.Vector3(radius, 0, 0))
        .applyAxisAngle(
            new THREE.Vector3(0, 0, 1),
            theta + thetaShift);
}

const shifts = [
    new THREE.Vector3(0, 0, 0),
    new THREE.Vector3(0, 0, .2),
    new THREE.Vector3(.1, 0, .2),
    new THREE.Vector3(.1, 0, 0),

    new THREE.Vector3(0, Math.PI/2, 0),
    new THREE.Vector3(0, Math.PI/2, .2),
    new THREE.Vector3(.1, Math.PI/2, .2),
    new THREE.Vector3(.1, Math.PI/2, 0),
];

const spiralMesh = new THREE.Mesh(
    stripTop(),
    new THREE.MeshNormalMaterial());
scene.add(spiralMesh);


const spiralGroup = new THREE.Group();
for (const shift of shifts) {
    spiralGroup.add(new THREE.Line(spiralLineGeometry(shift), lineMaterial))
}
scene.add(spiralGroup);

camera.position.z = 15;

function animate(time: number) {
    spiralGroup.rotation.x = time / 2000;
    spiralGroup.rotation.y = time / 1000;

    spiralMesh.rotation.x = time / 2000;
    spiralMesh.rotation.y = time / 1000;
    
    renderer.render(scene, camera);
}

renderer.setAnimationLoop(animate);

    