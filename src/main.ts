import * as THREE from 'three';
import { EffectComposer, RenderPass } from 'three/examples/jsm/Addons.js';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

import myCustomNoise from './shaders/chunks/myCustomNoise.glsl?raw';
THREE.ShaderChunk['myCustomNoise'] = myCustomNoise;

import wideStripVertexShader from './shaders/wideStrip.vert?raw';
import wideStripFragmentShader from './shaders/wideStrip.frag?raw';
import planeFragmentShader from './shaders/plane.frag?raw';
import thinStripVertexShader from './shaders/thinStrip.vert?raw';
import thinStripFragmentShader from './shaders/thinStrip.frag?raw';

import { PencilLinesPass } from './passes/pencilLinesPass';

const scene = new THREE.Scene()
const camera = new THREE.PerspectiveCamera(
    75,
    window.innerWidth / window.innerHeight,
    0.1,
    1000);

const renderer = new THREE.WebGLRenderer({
    //antialias: true
});
renderer.setSize(
    window.innerWidth,
    window.innerHeight);

const size = new THREE.Vector2();
renderer.getDrawingBufferSize(size);

const composer = new EffectComposer(renderer);
const renderPass = new RenderPass(scene, camera);
const pencilLinesPass = new PencilLinesPass({
    width: window.innerWidth,
    height: window.innerHeight,
    scene,
    camera
});

composer.addPass(renderPass);
composer.addPass(pencilLinesPass);

document.body.appendChild( renderer.domElement );
const controls = new OrbitControls( camera, renderer.domElement );

function quadStrip(
    points: THREE.Vector3[],
    normals: THREE.Vector3[]
): THREE.BufferGeometry {
    const geometry = new THREE.BufferGeometry();
    const positionElementSize = 3;
    const normalElementSize = 3;
    const uvElementSize = 2;

    geometry.setAttribute('position',
        new THREE.BufferAttribute(
            new Float32Array(points.flatMap(point => point.toArray())),
            positionElementSize));

    geometry.setAttribute('normal',
        new THREE.BufferAttribute(
            new Float32Array(normals.flatMap(normal => normal.toArray())),
            normalElementSize));

    geometry.setAttribute('uv',
        new THREE.BufferAttribute(
            new Float32Array(points.flatMap((point, i) => 
                [
                    i % 2,
                    Math.floor(i / 2) / (points.length / 2)
                ])),
            uvElementSize));

    const numQuads = (points.length / 2) - 1;
    const indexes: number[] = [];
    for (let i=0; i<numQuads*2; i+=2) {
        indexes.push(
            i+0, i+2, i+1,
            i+1, i+2, i+3);
    }
    geometry.setIndex(indexes);

    return geometry;
}

function strip(
    shift1: THREE.Vector3,
    shift2: THREE.Vector3,
): THREE.BufferGeometry {
    const revolutions = 1.5;
    const fidelity = .001;

    const tubeShift = new THREE.Vector3(1, 0, 0);

    const points = [];
    const normals: THREE.Vector3[] = [];
    for (let i=0; i<Math.PI*2 * revolutions; i+=fidelity) {
        const pt1 = spiralPoint(i, shift1)
        const pt2 = spiralPoint(i, shift2);
        points.push(pt1);
        points.push(pt2);

        normals.push(spiralPoint(i, shift1.clone().add(tubeShift)).sub(pt1));
        normals.push(spiralPoint(i, shift2.clone().add(tubeShift)).sub(pt2));
    }

    return quadStrip(points, normals);
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

const wideStripMaterial = new THREE.ShaderMaterial({
    uniforms: {
        u_resolution: {
            value: size
        },
        u_time: {
            value: 0.0
        },
        u_normalRotation: {
            value: new THREE.Matrix4()
        },
        u_uvShift: {
            value: new THREE.Vector2(0,0)
        },
        u_lightVec: {
            value: new THREE.Vector3(1, .5, .7)
        }
    },
    vertexShader: wideStripVertexShader,
    fragmentShader: wideStripFragmentShader
});
const thinStripMaterial = new THREE.ShaderMaterial({
    uniforms: {
        u_resolution: {
            value: size
        }
    },
    vertexShader: thinStripVertexShader,
    fragmentShader: thinStripFragmentShader
});

const stripMaterials = [
    wideStripMaterial,
    thinStripMaterial,
    wideStripMaterial,
    thinStripMaterial
]


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
            stripMaterials[j]));
    }
}

scene.add(stripGroup);

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

camera.position.z = 15 ;

stripGroup.rotateZ(-3 / 4 * Math.PI);
stripGroup.rotateX(-.8);


const timer = new THREE.Timer();
timer.connect(document);
let lastTime = timer.getElapsed();

function matrix4FromMatrix3(matrix3: THREE.Matrix3) {
  const m3 = matrix3.elements; // Array of 9 elements
  const matrix4 = new THREE.Matrix4();
  
  // Three.js uses column-major order internally
  matrix4.set(
    m3[0], m3[3], m3[6], 0,
    m3[1], m3[4], m3[7], 0,
    m3[2], m3[5], m3[8], 0,
        0,     0,     0, 1
  );
  
  return matrix4;
}

function animate(time: number) {
    timer.update();
    const totalTime = timer.getElapsed();
    const timeStep = timer.getElapsed() - lastTime;
    lastTime = totalTime;

    const rotationScale = .5;
    const stepRotation = timeStep * rotationScale;
    const totalRotation = totalTime * rotationScale;


    stripGroup.rotateZ(stepRotation);
    
    wideStripMaterial.uniforms.u_time!.value = time;
    wideStripMaterial.uniforms.u_normalRotation!.value = new THREE.Matrix4()
        .makeRotationZ(-totalRotation);

    const lightVector = new THREE.Vector3(-.2, -1, -.2).normalize()
        .applyAxisAngle(new THREE.Vector3(0,0,1), -totalRotation);

    wideStripMaterial.uniforms.u_lightVec!.value = lightVector;

    composer.render();
}

renderer.setAnimationLoop(animate);