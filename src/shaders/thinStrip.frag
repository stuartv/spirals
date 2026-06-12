#define PI 3.14159265358979323846

uniform vec2 u_resolution;
uniform float u_time;
varying vec3 vNormal;
varying vec2 vUv;

/// vvv NOISE vvv

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

/// ^^^ NOISE ^^^

void main() {    
    float numLines = 300.0;
    float stripeWidth = mix(.01, .99, vNormal.x * .5 + .5);

    float isStripe = step(fract(vUv.y * numLines), stripeWidth);
    if (isStripe > .5) {
        blackInk();
    } else {
        paperGrain();
    }
}