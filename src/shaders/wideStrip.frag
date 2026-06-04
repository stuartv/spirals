#define PI 3.14159265358979323846

uniform vec2 u_resolution;
uniform float u_time;
varying vec3 vNormal;
varying vec2 vUv;

void main() {
    vec3 normalized = normalize(vNormal);

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

    float squareScale = distance(vec2(.5, .5), st) * 1.6;
        
    float squareSizeX = squareScale / gridNumX;
    float squareSizeY = squareScale / gridNumY;

    bool isInSquare =
        abs(squareCenter.x - st.x) < squareSizeX * .5 &&
        abs(squareCenter.y - st.y) < squareSizeY * .5;

    vec3 color = isInSquare
        ? vec3(0.0, 0.0, 0.0)
        : vec3(1.0, 1.0, 1.0);

    gl_FragColor = vec4(color, 1.0);
}