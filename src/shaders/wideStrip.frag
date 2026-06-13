#define PI 3.14159265358979323846

uniform vec2 u_resolution;
uniform float u_time;
varying vec3 vNormal;
varying vec2 vUv;

#include <myCustomNoise>

void stripe(vec2 uv, vec3 normal) {
    float numLines = 4.0;
    float stripeWidth = max(0.0, .5 * (normal.y * .45 + .5));
    float isStripe = step(fract(uv.x * numLines), stripeWidth);
    if (isStripe > .5) {
        grayInk();
    } else {
        paperGrain();
    }
}

void main() {
    // TODO: eliminate branching
    float edgeWidth = .05;
    if (vUv.x < edgeWidth || vUv.x > 1.0 - edgeWidth) {
        blackInk();
        return;
    }

    vec3 normalized = normalize(vNormal);
    vec3 source = normalize(vec3(-1.0, -1.0, -1.0));
    float squareScale = length(normalized + source) / 2.0;

    // Map normal to spherical coordinates
    float theta = atan(normalized.y, normalized.x);
    float phi = acos(normalized.z);

    // Normalize to [0,1]
    vec2 st = vec2(
        theta / (2.0 * PI) + .5,
        phi / PI);
    
    float gridNumX = 90.0;
    float gridNumY = 45.0;
    
	vec2 squareCenter = vec2(
        (floor(st.x * gridNumX) + .5) / gridNumX,
        (floor(st.y * gridNumY) + .5) / gridNumY);

    // float squareScale = distance(vec2(.5, .5), st) * 1.6;
        
    float squareSizeX = squareScale / gridNumX;
    float squareSizeY = squareScale / gridNumY;

    bool isInSquare =
        abs(squareCenter.x - st.x) < squareSizeX * .5 &&
        abs(squareCenter.y - st.y) < squareSizeY * .5;
    
    if (isInSquare) {
        blackInk();
    } else {
        stripe(vUv, normalized);
    }
}