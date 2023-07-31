varying vec2 vUv0;

uniform sampler2D uDiffuseMap;
uniform sampler2D uHeightMap;
uniform float uTime;
uniform vec3 accentColour;


void main(void)
{
    vec2 v_UV = vec2(gl_FragCoord.x / 500.0 + uTime, (1.0 - gl_FragCoord.y) / 500.0 + uTime);

    float height = texture2D(uHeightMap, v_UV).r;
    vec4 color = texture2D(uDiffuseMap, v_UV);
    //color *= (1.0 - vUv0.y);

    //vec4(0.98,0.83,0.21,1.0);
    
    //vec4 solidColor = vec4(0.33, 0.21, 0.98, 1.0);    
    vec4 solidColor = vec4(accentColour.rgb, 1.0);    
    
    
    //if (height < uTime) {
    //  discard;
    //}
    //if (height < (uTime+0.04)) {
    //  color = vec4(0, 0.2, 1, 1.0);
    //}

    //mix(color,solidColor,(1.0 - vUv0.y));
    float lerp = (1.0 - vUv0.y) * 4.0;
    gl_FragColor = vec4(mix(solidColor, color,clamp(lerp,0.0,1.0)).rgb,1.0);
}