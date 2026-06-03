#define PI 3.14159265358979323846

uniform vec2 u_resolution;
varying vec3 vNormal;

void main() {
    // Map normal to plane
    float r = length(vNormal);
    float theta = atan(vNormal.y, vNormal.x);
    float phi = acos(vNormal.z / r);

    // Normalize to [0,1]
    vec2 st = vec2(theta / (2.0 * PI), phi / PI);
    
    float color = 0.0;
    float gridXFreq = 1.0 / 40.0;
    float gridYFreq = 1.0 / 40.0;
    float gridXWidth = .01; //* sin(st.x * PI);
    float gridYWidth = .01; //* sin(st.y * PI);
    
    if (mod(st.x, gridXFreq) < gridXWidth){
        color = 1.0;
    } else if (mod(st.y, gridYFreq) < gridYWidth){
        color = 1.0;
    }

    gl_FragColor = vec4(color, color, color, 1.0);
}