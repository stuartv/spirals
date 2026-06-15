// Declare the varying variable (same name and type in both shaders)
varying vec3 vPosition;
varying vec3 vNormal;
varying vec2 vUv;

void main() {
    // Pass the local vertex position data to the fragment shader
    vPosition = position; 

    // vNormal = normal;
    vNormal = vec3(vec4(normal, 1.0) * inverse(modelViewMatrix));
    float x = vNormal[0];
    float y = vNormal[1];
    float z = vNormal[2];
     vNormal = vec3(x, z, -y);

    vUv = uv;

    // Standard projection formula required by Three.js
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}