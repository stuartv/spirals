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

const geometry = new THREE.BoxGeometry(1,1,1);
const material = new THREE.MeshBasicMaterial({
    color: new THREE.Color(0,255,0)
});
const cube = new THREE.Mesh(geometry, material);
scene.add(cube);

const lineMaterial = new THREE.LineBasicMaterial({
    color: new THREE.Color(255,0,0)
});
const points = [];
points.push(new THREE.Vector3(-10,  0, 0));
points.push(new THREE.Vector3(  0, 10, 0));
points.push(new THREE.Vector3( 10,  0, 0));
const lineGeometry = new THREE.BufferGeometry()
    .setFromPoints(points);
const line = new THREE.Line(lineGeometry, lineMaterial);
scene.add(line);

camera.position.z = 15;

function animate(time: number) {
    cube.rotation.x = time / 2000;
    cube.rotation.y = time / 1000;

    line.rotation.x = time / 2000;
    line.rotation.y = time / 1000;
    
    renderer.render( scene, camera);
}

renderer.setAnimationLoop(animate);

    