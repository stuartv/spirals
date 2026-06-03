// Declare the varying variable (same name and type in both shaders)
varying vec3 vPosition;
varying vec3 vNormal;

void main() {
    // Pass the local vertex position data to the fragment shader
    vPosition = position; 
    vNormal = normal;

    // Standard projection formula required by Three.js
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}