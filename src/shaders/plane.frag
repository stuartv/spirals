#ifdef GL_ES
precision mediump float;
#endif

uniform vec2 u_resolution;
uniform vec2 u_mouse;
uniform float u_time;
varying vec2 vUv;

#include <myCustomNoise>

void main() {
    // vec2 p = vUv.xy;
    // vec2 p = vec2(sin(gl_FragCoord.x), sin(gl_FragCoord.y));
    vec2 p = vec2(
        gl_FragCoord.x / min(u_resolution.x, u_resolution.y),
        gl_FragCoord.y / min(u_resolution.x, u_resolution.y)
        );


    float border = .1;
    border += .005 * noise(p * vec2(10.0));
    
    if (
        p.x < border || p.x > 1.0 - border ||
        p.y < border || p.y > 1.0 - border
    ) {
        paperGrain(p);
    } else {
        grayInk(p);
    }
}