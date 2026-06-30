import * as THREE from 'three';
import { EffectComposer, RenderPass } from 'three/examples/jsm/Addons.js';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

import { RibbonGroup } from './geometry/ribbonGroup';
import { BackgroundMaterial } from './shaderMaterials/backgroundMaterial';

import myCustomNoise from './shaders/chunks/myCustomNoise.glsl?raw';
// @ts-expect-error
THREE.ShaderChunk['myCustomNoise'] = myCustomNoise;

import { InputInterface } from './inputInterface';
import { AnimationInterface } from './animationInterface';

import { PencilLinesPass } from './passes/pencilLinesPass';

const canvas = document.getElementById('spirals') as HTMLCanvasElement;
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;
const size = new THREE.Vector2(
    canvas.width,
    canvas.height
);

const scene = new THREE.Scene()
const camera = new THREE.PerspectiveCamera(
    75,
    size.x / size.y,
    0.1,
    100);

const renderer = new THREE.WebGLRenderer({canvas});

renderer.setSize(size.x, size.y);
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

const inputInterface = new InputInterface(renderer.domElement);

composer.addPass(pencilLinesPass);

const ribbonGroup: RibbonGroup = new RibbonGroup({
    screenSize: size,
    numRibbons: 4,
    numTicks: 1000});
scene.add(ribbonGroup.getMesh());
ribbonGroup.getMesh().rotateX(-1);

camera
    .add(new THREE.Mesh(
        new THREE.PlaneGeometry(5000, 5000),
        new BackgroundMaterial(size))
    .translateZ(camera.far * -.99));

scene.add(camera);

const pointLight = new THREE.PointLight(
    new THREE.Color(255, 255, 255),
    1, 100, 2);
pointLight.position.set(10, 10, 10);
scene.add(pointLight);

camera.position.set(0, 0, 15);

const timer = new THREE.Timer();
timer.connect(document);
let lastTime = timer.getElapsed();

const animationInterface = new AnimationInterface();
inputInterface.registerClickEvent(() => animationInterface.add(timer.getElapsed()));
for(let i=0; i<animationInterface.getTotalPresets(); i++) {
  inputInterface.registerKeyPress(String(i),
  () => animationInterface.addSpecific(i-1, timer.getElapsed()));
}

// window.addEventListener("resize", () => {
//     console.log("setting size");
//     setSize({camera, renderer});
// });

function animate(time: number) {
    timer.update();

    const curTime = timer.getElapsed();
    const timeStepDuration = curTime - lastTime;
    lastTime = curTime;

    ribbonGroup.animate({
        time: curTime,
        timeStepDuration,
        animationSettings: animationInterface.calculateSettings(curTime)
    });

    composer.render();
}

renderer.setAnimationLoop(animate);