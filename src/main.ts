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



// const boxGeometry = new THREE.BoxGeometry(3,3,3);
// const material = new THREE.MeshNormalMaterial();
// const cube = new THREE.Mesh(boxGeometry, material);
// scene.add(cube);

// const directionalLight = new THREE.DirectionalLight(
//     new THREE.Color(255,255,255),
//     0.1);
// directionalLight.position.set(2,2,8);
// scene.add(directionalLight);

// const ambientLight = new THREE.AmbientLight(
//     new THREE.Color(255,255,255),
//     .001);
// scene.add(ambientLight);

const lineMaterial = new THREE.LineBasicMaterial({
    color: new THREE.Color(255,0,0)
});
const points = [];

function spiralPoint(theta: number): THREE.Vector3 {
    const radius = 3;
    const tube = 1;
    const freq = 10;

    return new THREE.Vector3(tube, 0, 0)
        .applyAxisAngle(
            new THREE.Vector3(0, 0, 1),
            theta * freq)
        .applyAxisAngle(
            new THREE.Vector3(1, 0, 0),
            Math.PI / 2)
        .add(
            new THREE.Vector3(radius, 0, 0))
        .applyAxisAngle(
            new THREE.Vector3(0, 0, 1),
            theta);
}

for (let i=0; i<6; i+=.01) {
    points.push(spiralPoint(i));
}
const lineGeometry = new THREE.BufferGeometry()
    .setFromPoints(points);
const line = new THREE.Line(lineGeometry, lineMaterial);
scene.add(line);

camera.position.z = 15;

function animate(time: number) {
    // cube.rotation.x = time / 2000;
    // cube.rotation.y = time / 1000;

    line.rotation.x = time / 2000;
    line.rotation.y = time / 1000;
    
    renderer.render( scene, camera);
}

renderer.setAnimationLoop(animate);

    