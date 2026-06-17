#define PI 3.14159265358979323846

uniform vec2 u_resolution;
uniform float u_time;
uniform vec3 u_lightVec;
varying vec3 vNormal;
varying vec2 vUv;

#include <myCustomNoise>

void main() {
    float numLines = 600.0;

    vec3 normalized = normalize(vNormal);
    vec3 source = normalize(u_lightVec);
    float stripeWidth = length(normalized + source) / 2.0;
    stripeWidth =  mix(.03, .99, pow(stripeWidth, 2.5));

    float isStripe = step(fract(vUv.y * numLines), stripeWidth);
    if (isStripe > .5) {
        blackInk();
    } else {
        paperGrain();
    }
}