// Declare the varying variable (same name and type in both shaders)
varying vec3 vPosition;
varying vec3 vNormal;
varying vec2 vUv;

uniform mat4 u_normalRotation;
uniform vec2 u_uvShift;
uniform vec3 u_lightVec;

uniform mat4 u_projectionMatrixInverse;

void main() {
    // Pass the local vertex position data to the fragment shader
    vPosition = position; 
    vNormal = normal;
    vUv = uv;

    // Standard projection formula required by Three.js
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}