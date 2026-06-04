#define PI 3.14159265358979323846

uniform vec2 u_resolution;
uniform float u_time;
varying vec3 vNormal;
varying vec2 vUv;

void main() {    
    float numLines = 300.0;
    float stripeWidth = mix(.01, .99, vNormal.x * .5 + .5);

    float isStripe = step(fract(vUv.y * numLines), stripeWidth);

    gl_FragColor = vec4(isStripe, isStripe, isStripe, 1.0);
}