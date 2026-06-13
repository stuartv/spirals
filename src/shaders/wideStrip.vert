// Declare the varying variable (same name and type in both shaders)
varying vec3 vPosition;
varying vec3 vNormal;
varying vec2 vUv;

layout(location = 0) in vec3 aNormal;

void main() {
    // Pass the local vertex position data to the fragment shader
    vPosition = position; 

    mat3 normalMatrix = transpose(inverse(mat3(modelViewMatrix)));
    vNormal = normalMatrix * normal;
    // vNormal = normal;

    vUv = uv;

    // Standard projection formula required by Three.js
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}