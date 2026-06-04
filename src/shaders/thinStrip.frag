#define PI 3.14159265358979323846

uniform vec2 u_resolution;
uniform float u_time;
varying vec3 vNormal;
varying vec2 vUv;

void main() {
    gl_FragColor = vec4(vUv.x, vUv.y, 0.0, 1.0);
}