varying vec2 vUv0;

uniform sampler2D uDiffuseMap;
uniform sampler2D uHeightMap;
uniform float uTime;

void main(void)
{
    float height = texture2D(uHeightMap, gl_FragCoord.xy / 500.0 + uTime).r;
    vec4 color = texture2D(uDiffuseMap, gl_FragCoord.xy / 500.0 + uTime);
    //color *= (1.0 - vUv0.y);
    vec4 solidColor = vec4(0.98,0.83,0.21,1.0);
    
    //if (height < uTime) {
    //  discard;
    //}
    //if (height < (uTime+0.04)) {
    //  color = vec4(0, 0.2, 1, 1.0);
    //}

    //mix(color,solidColor,(1.0 - vUv0.y));
    float lerp = (1.0 - vUv0.y) * 4.0;
    gl_FragColor = mix(solidColor, color,clamp(lerp,0.0,1.0));
}