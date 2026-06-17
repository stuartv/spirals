uniform mat4 u_projectionMatrixInverse;

void main() {
    float depth = gl_FragCoord.z;

    vec4 unprojected = u_projectionMatrixInverse * vec4(0, 0, depth, 1.0);

    gl_FragColor = vec4(vec3(unprojected.w), 1.0);
}