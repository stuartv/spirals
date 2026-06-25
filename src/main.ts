import * as THREE from 'three';
import { EffectComposer, RenderPass } from 'three/examples/jsm/Addons.js';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

import { RibbonGroup } from './geometry/ribbonGroup';
import { BackgroundMaterial } from './shaderMaterials/backgroundMaterial';
import myCustomNoise from './shaders/chunks/myCustomNoise.glsl?raw';
// @ts-expect-error
THREE.ShaderChunk['myCustomNoise'] = myCustomNoise;

import { PencilLinesPass } from './passes/pencilLinesPass';
import { ShaderPass } from 'three/examples/jsm/postprocessing/ShaderPass.js';
import { FXAAShader } from 'three/examples/jsm/shaders/FXAAShader.js';

const size = new THREE.Vector2(
    window.innerWidth,
    window.innerHeight
);

const scene = new THREE.Scene()
const camera = new THREE.PerspectiveCamera(
    75,
    size.x / size.y,
    0.1,
    100);

const renderer = new THREE.WebGLRenderer();
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

// Setup and add FXAA (Anti-alising)
// const fxaaPass = new ShaderPass(FXAAShader);
// fxaaPass.uniforms['resolution'].value.x = 1 / (size.x * renderer.getPixelRatio());
// fxaaPass.uniforms['resolution'].value.y = 1 / (size.y * renderer.getPixelRatio());
// composer.addPass(fxaaPass);

composer.addPass(pencilLinesPass);

const ribbonGroup: RibbonGroup = new RibbonGroup({
    screenSize: size,
    numRibbons: 4,
    numTicks: 1000});
scene.add(ribbonGroup.getMesh());
ribbonGroup.getMesh().rotateX(-.8);

camera
    .add(new THREE.Mesh(
        new THREE.PlaneGeometry(5000, 5000),
        new BackgroundMaterial(size))
    .translateZ(camera.far * -.99));

scene.add(camera);

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


const pointLight = new THREE.PointLight(
    new THREE.Color(255, 255, 255),
    1, 100, 2);
pointLight.position.set(10, 10, 10);
scene.add(pointLight);

camera.position.set(0, 0, 15);


const timer = new THREE.Timer();
timer.connect(document);
let lastTime = timer.getElapsed();

function animate(time: number) {
    timer.update();
    const totalTime = timer.getElapsed();
    const timeStep = timer.getElapsed() - lastTime;
    lastTime = totalTime;

    ribbonGroup.animate({
        time: totalTime,
        timeStepDuration: timeStep
    });

    composer.render();
}

renderer.setAnimationLoop(animate);