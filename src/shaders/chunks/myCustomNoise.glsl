#define noise_scale 900.0

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
    vec3 paperColor = vec3(.844, .778, .691);
    vec3 darkest    = vec3(.0,   .0,   .0);
    gl_FragColor = vec4(mix(vec3(darkest), vec3(paperColor), value), 1.0);
}

vec2 getScreenP() {
    return vec2(
        gl_FragCoord.x / min(u_resolution.x, u_resolution.y),
        gl_FragCoord.y / min(u_resolution.x, u_resolution.y)
        );
}

void blackInk(vec2 p) {
    setColor(ramp(p, vec2(noise_scale), 0.05, 0.2));
}

void blackInk() {
    blackInk(getScreenP());
}

void grayInk(vec2 p) {
    setColor(ramp(p, vec2(noise_scale), 0.10, 1.0));
}

void grayInk() {
    grayInk(getScreenP());
}

void paperGrain(vec2 p) {
    setColor(ramp(p, vec2(noise_scale, 25.0), 0.70, 0.8));
}

void paperGrain() {
    paperGrain(getScreenP());
}