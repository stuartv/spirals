#define PI 3.14159265358979323846

uniform vec2 u_resolution;
varying vec3 vNormal;

void main() {
    // Map normal to spherical coordinates
    float r = length(vNormal);
    float theta = atan(vNormal.y, vNormal.x);
    float phi = acos(vNormal.z / r);

    // Normalize to [0,1]
    vec2 st = vec2(
        theta / (2.0 * PI) + .5,
        phi / PI);

    // gl_FragColor = vec4(st.y, st.x, 0.0, 1.0);
    // return;
    
    float color = 0.0;
    float gridNumX = 30.0;
    float gridNumY = 30.0;
    
	vec2 squareCenter = vec2(
        (floor(st.x * gridNumX) + .5) / gridNumX,
        (floor(st.y * gridNumY) + .5) / gridNumY);
    
    float squareSize = max(
        abs(squareCenter.x - .5),
        abs(squareCenter.y - .5)) * .03;

    // squareSize = .008;
    
	if (
        abs(squareCenter.x - st.x) > squareSize ||
        abs(squareCenter.y - st.y) > squareSize
    ){
        color = 1.0;
    }

    gl_FragColor = vec4(color, color, color, 1.0);
}