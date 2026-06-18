uniform mat4 u_projectionMatrixInverse;

void main() {
    // Standard projection formula required by Three.js
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}