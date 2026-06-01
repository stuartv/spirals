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

const spiralGroup = new THREE.Group();
for (const shift of shifts) {
    spiralGroup.add(new THREE.Line(spiralLineGeometry(shift), lineMaterial))
}
scene.add(spiralGroup);

camera.position.z = 15;

function animate(time: number) {
    spiralGroup.rotation.x = time / 2000;
    spiralGroup.rotation.y = time / 1000;
    
    renderer.render(scene, camera);
}

renderer.setAnimationLoop(animate);

    