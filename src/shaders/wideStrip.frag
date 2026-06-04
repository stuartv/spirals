#define PI 3.14159265358979323846

uniform vec2 u_resolution;
uniform float u_time;
varying vec3 vNormal;

mat3 rotateX(float theta) {
    float c = cos(theta);
    float s = sin(theta);
    return mat3(
        vec3(1.0, 0.0, 0.0),
        vec3(0.0, c,   s),
        vec3(0.0, -s,  c)
    );
}

void main() {
    // Rotate to change light direction
    // vec3 rotated = rotateX(u_time * .001) * vNormal;

    vec3 normalized = normalize(vNormal);

    // Map normal to spherical coordinates
    float r = length(normalized);
    float theta = atan(normalized.y, normalized.x);
    float phi = acos(normalized.z / r);

    // Normalize to [0,1]
    vec2 st = vec2(
        theta / (2.0 * PI) + .5,
        phi / PI);

    // Move light source by shifting coordinates
    vec2 shift = vec2(0.0, 0.0);
    st.x = fract(st.x + shift.x);
    st.y = fract(st.y + shift.y);

    // gl_FragColor = vec4(st.y, st.x, 0.0, 1.0);
    // return;
    
    float gridNumX = 90.0;
    float gridNumY = 45.0;
    
	vec2 squareCenter = vec2(
        (floor(st.x * gridNumX) + .5) / gridNumX,
        (floor(st.y * gridNumY) + .5) / gridNumY);

    float squareScale = distance(vec2(.5, .5), st) * 1.6;
    // float squareScale = max(
    //     cos(st.x * 2.0 * PI) * .5 + .5,
    //     cos(st.y * 2.0 * PI) * .5 + .5);
        
    float squareSizeX = squareScale / gridNumX;
    float squareSizeY = squareScale / gridNumY;

    bool isInSquare =
        abs(squareCenter.x - st.x) < squareSizeX * .5 ||
        abs(squareCenter.y - st.y) < squareSizeY * .5;

    vec3 color = isInSquare
        ? vec3(1.0, 1.0, 1.0)
        : vec3(0.0, 0.0, 0.0);

    gl_FragColor = vec4(color, 1.0);
}