import * as THREE from 'three';
import { EffectComposer, RenderPass } from 'three/examples/jsm/Addons.js';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

import myCustomNoise from './shaders/chunks/myCustomNoise.glsl?raw';
THREE.ShaderChunk['myCustomNoise'] = myCustomNoise;

import { StripGroup } from './geometry/stripGroup';

import wideStripVertexShader from './shaders/wideStrip.vert?raw';
import planeFragmentShader from './shaders/plane.frag?raw';

import { PencilLinesPass } from './passes/pencilLinesPass';

const size = new THREE.Vector2(
    window.innerWidth,
    window.innerHeight
);

const scene = new THREE.Scene()
const camera = new THREE.PerspectiveCamera(
    75,
    size.x / size.y,
    0.1,
    1000);

const renderer = new THREE.WebGLRenderer({});
renderer.setSize(size.x, size.y);
document.body.appendChild( renderer.domElement );
const controls = new OrbitControls( camera, renderer.domElement );

const composer = new EffectComposer(renderer);
const renderPass = new RenderPass(scene, camera);
const pencilLinesPass = new PencilLinesPass({
    width: size.x,
    height: size.y,
    scene,
    camera
});

composer.addPass(renderPass);
composer.addPass(pencilLinesPass);

const stripGroup: StripGroup = new StripGroup(size);
stripGroup.geometry = stripGroup.buildStripGroup();
scene.add(stripGroup.geometry);

// scene.add(new THREE.Mesh(
//     new THREE.TorusGeometry( 5, 2, 16, 100 ),
//     wideStripMaterial
// ));

// scene.add(new THREE.Mesh(
//     new THREE.SphereGeometry(5),
//     wideStripMaterial
// ));

// scene.add(new THREE.Mesh(
//     new THREE.TorusGeometry( 5, 2, 16, 100 ),
//     new THREE.MeshLambertMaterial({
//         color: new THREE.Color(0,1,0)})));

camera.add(new THREE.Mesh(
    new THREE.PlaneGeometry(5000, 5000),
    new THREE.ShaderMaterial({
        uniforms: {
            u_resolution: {
                value: size
            }
        },
        vertexShader: wideStripVertexShader,
        fragmentShader: planeFragmentShader,
        depthWrite: false
    })).translateZ(camera.far * -.99));

scene.add(camera);

const pointLight = new THREE.PointLight(
    new THREE.Color(255, 255, 255),
    1, 100, 2);
pointLight.position.set(10, 10, 10);
scene.add(pointLight);

camera.position.set(0, 0, 15);

stripGroup.geometry.rotateX(-.8);


const timer = new THREE.Timer();
timer.connect(document);
let lastTime = timer.getElapsed();

function animate(time: number) {
    timer.update();
    const totalTime = timer.getElapsed();
    const timeStep = timer.getElapsed() - lastTime;
    lastTime = totalTime;

    const rotationScale = .5;
    const stepRotation = timeStep * rotationScale;
    const totalRotation = totalTime * rotationScale;

    stripGroup.geometry.rotateZ(stepRotation);
    
    stripGroup.wideStripMaterial.uniforms.u_time!.value = time;
    stripGroup.wideStripMaterial.uniforms.u_normalRotation!.value = new THREE.Matrix4()
        .makeRotationZ(-totalRotation);

    const lightVector = new THREE.Vector3(.6, -.8, -.2).normalize()
        .applyAxisAngle(new THREE.Vector3(0,0,1), -totalRotation);

    stripGroup.wideStripMaterial.uniforms.u_lightVec!.value = lightVector;
    stripGroup.thinStripMaterial.uniforms.u_lightVec!.value = lightVector;


    composer.render();
}

renderer.setAnimationLoop(animate);