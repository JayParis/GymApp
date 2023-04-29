varying vec2 vUv0;

uniform sampler2D uDiffuseMap;
uniform sampler2D uHeightMap;
uniform float uTime;

void main(void)
{
    float height = texture2D(uHeightMap, gl_FragCoord.xy / 500.0 + uTime).r;
    vec4 color = texture2D(uDiffuseMap, gl_FragCoord.xy / 500.0 + uTime);
    //if (height < uTime) {
    //  discard;
    //}
    //if (height < (uTime+0.04)) {
    //  color = vec4(0, 0.2, 1, 1.0);
    //}
    gl_FragColor = color;
}