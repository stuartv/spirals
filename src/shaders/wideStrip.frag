#define PI 3.14159265358979323846

uniform vec2 u_resolution;
uniform float u_time;
varying vec3 vNormal;
varying vec2 vUv;

vec2 grad( ivec2 z )  // replace this anything that returns a random vector
{
    // 2D to 1D  (feel free to replace by some other)
    int n = z.x+z.y*11111;

    // Hugo Elias hash (feel free to replace by another one)
    n = (n<<13)^n;
    n = (n*(n*n*15731+789221)+1376312589)>>16;

    // Perlin style vectors
    n &= 7;
    vec2 gr = vec2(n&1,n>>1)*2.0-1.0;
    return ( n>=6 ) ? vec2(0.0,gr.x) : 
           ( n>=4 ) ? vec2(gr.x,0.0) :
                              gr;
}

float noise( in vec2 p )
{
    ivec2 i = ivec2(floor( p ));
     vec2 f =       fract( p );
	
	vec2 u = f*f*(3.0-2.0*f); // feel free to replace by a quintic smoothstep instead

    return mix( mix( dot( grad( i+ivec2(0,0) ), f-vec2(0.0,0.0) ), 
                     dot( grad( i+ivec2(1,0) ), f-vec2(1.0,0.0) ), u.x),
                mix( dot( grad( i+ivec2(0,1) ), f-vec2(0.0,1.0) ), 
                     dot( grad( i+ivec2(1,1) ), f-vec2(1.0,1.0) ), u.x), u.y);
}

float ramp(vec2 p, vec2 scale, float minVal, float maxVal) {
    return mix(minVal, maxVal, .5 * noise(vec2(scale.x * p.x, scale.y * p.y)) + .5);
}

void setColor(float value) {
    vec3 paperColor = vec3(.945, .910, .746);
    vec3 darkest    = vec3(.0,   .0,   .0);
    // gl_FragColor = vec4(
    //     gl_FragCoord.x / u_resolution.x,
    //     gl_FragCoord.y / u_resolution.y,
    //     0.0, 1.0);
    gl_FragColor = vec4(mix(vec3(darkest), vec3(paperColor), value), 1.0);
}

vec2 paperSpace() {
    return vec2(
        gl_FragCoord.x / min(u_resolution.x, u_resolution.y),
        gl_FragCoord.y / min(u_resolution.x, u_resolution.y));
}

void blackInk() {
    setColor(ramp(paperSpace(), vec2(40.0), 0.05, 0.2));
}

void grayInk() {
    setColor(ramp(paperSpace(), vec2(400.0), 0.10, 1.0));
}

void paperGrain() {
    setColor(ramp(paperSpace(), vec2(400.0, 25.0), 0.70, 0.8));
}

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