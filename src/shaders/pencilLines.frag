uniform sampler2D tDiffuse;
uniform vec2 uResolution;
uniform sampler2D uNormals;
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
        gl_FragCoord.x / min(uResolution.x, uResolution.y),
        gl_FragCoord.y / min(uResolution.x, uResolution.y));
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

float valueAtPoint(sampler2D image, vec2 coord, vec2 texel, vec2 point) {
    vec3 luma = vec3(0.299, 0.587, 0.114);

    return dot(texture2D(image, coord + texel * point).xyz, luma);
}

float diffuseValue(int x, int y) {
    return valueAtPoint(tDiffuse, vUv, vec2(1.0 / uResolution.x, 1.0 / uResolution.y), vec2(x, y)) * 0.6;
}

float normalValue(int x, int y) {
    return valueAtPoint(uNormals, vUv, vec2(1.0 / uResolution.x, 1.0 / uResolution.y), vec2(x, y)) * 0.3;
}

float getValue(int x, int y) {
    return normalValue(x, y); //+ diffuseValue(x, y);
}

float combinedSobelValue() {
    // kernel definition (in glsl matrices are filled in column-major order)
    const mat3 Gx = mat3(-1, -2, -1, 0, 0, 0, 1, 2, 1);// x direction kernel
    const mat3 Gy = mat3(-1, 0, 1, -2, 0, 2, -1, 0, 1);// y direction kernel

    // fetch the 3x3 neighbourhood of a fragment

    // first column
    float tx0y0 = getValue(-1, -1);
    float tx0y1 = getValue(-1, 0);
    float tx0y2 = getValue(-1, 1);

    // second column
    float tx1y0 = getValue(0, -1);
    float tx1y1 = getValue(0, 0);
    float tx1y2 = getValue(0, 1);

    // third column
    float tx2y0 = getValue(1, -1);
    float tx2y1 = getValue(1, 0);
    float tx2y2 = getValue(1, 1);

    // gradient value in x direction
    float valueGx = Gx[0][0] * tx0y0 + Gx[1][0] * tx1y0 + Gx[2][0] * tx2y0 +
    Gx[0][1] * tx0y1 + Gx[1][1] * tx1y1 + Gx[2][1] * tx2y1 +
    Gx[0][2] * tx0y2 + Gx[1][2] * tx1y2 + Gx[2][2] * tx2y2;

    // gradient value in y direction
    float valueGy = Gy[0][0] * tx0y0 + Gy[1][0] * tx1y0 + Gy[2][0] * tx2y0 +
    Gy[0][1] * tx0y1 + Gy[1][1] * tx1y1 + Gy[2][1] * tx2y1 +
    Gy[0][2] * tx0y2 + Gy[1][2] * tx1y2 + Gy[2][2] * tx2y2;

    // magnitude of the total gradient
    float G = (valueGx * valueGx) + (valueGy * valueGy);
    return clamp(G, 0.0, 1.0);
}

void main() {
    float sobelValue = combinedSobelValue();
    sobelValue = smoothstep(0.01, 0.03, sobelValue);

    vec4 lineColor = vec4(0.0, 1.0, 0.0, 1.0);

    if (sobelValue > .1) {
        blackInk();
    } else {
        gl_FragColor = texture2D(tDiffuse, vUv);
        // gl_FragColor = vec4(1.0);
        // gl_FragColor = texture2D(uNormals, vUv);
    }
}
