float rand(float p)
{
    return fract(sin(p)*43758.5453);
}
float rand21(vec2 p)
{
 	return fract(sin(dot(p, vec2(1., 113.)))*43758.5453123);   
}
vec3 ACES(vec3 x)
{
    float a = 2.51;
    float b = .03;
    float c = 2.43;
    float d = .59;
    float e = .14;
    return clamp((x*(a*x + b))/(x*(c*x + d) + e), 0., 1.);
}
void mainImage( out vec4 fragColor, in vec2 fragCoord )
{
    vec2 uv = fragCoord.xy/iResolution.xy;
    
    int x = int(uv.y*512.);
    //float freq = texelFetch(iChannel1, ivec2(x, 0), 0).r - .5;
    float wave = texelFetch(iChannel1, ivec2(x, 1), 0).r - .5;
    //col = vec3(freq, 4.*freq*(1. - feq), 1. - freq)*freq;
    //col = vec3(freq,  4.*freq*(1. - feq), 1. - freq)*step(uv.y, freq);
    //col += vec3(smoothstep(.08, .02, abs(uv.y - wave)));
    
    float shake = fract(cos(uv.y*3.14*100. + iTime*20.)*43758.)*.02*wave;
    uv.x += shake;
    
    float id = floor(uv.y*40.);
    float glitch = rand(id + mod(iTime, 1000.));
    if(glitch > .999)
        uv.x += (rand(id) - .5)*.05;
    
    vec2 blurR = vec2(100.)/iResolution.xy;
    vec3 col = vec3(0.);
    float STEPS = 20.;
    float phiOffs = rand(dot(fragCoord.xy, vec2(1.12, 2.25)) + iTime);
    for(float i = 0.; i < STEPS; i++)
    {
        vec2 r = blurR*i/STEPS;
        float phi = (i/STEPS + phiOffs)*2.*3.1415926;
        vec2 q = uv + vec2(sin(phi), cos(phi))*r;
        col += texture(iChannel0, q).rgb;
    }
    col.rgb = mix(textureLod(iChannel0, uv, 0.).rgb, col/STEPS, .2);
    float exposure = .2*(1. + .2*sin(.5*iTime)*sin(1.8*iTime));
    col = ACES(exposure*col);
    
    float abber = smoothstep(.25, .5, abs(uv.x - .5));
    float offset = .004*abber;
    vec3 colR = vec3(0.);
    vec3 colB = vec3(0.);
    colR = textureLod(iChannel0, uv + vec2(offset, 0.), 0.).rgb;
    colB = textureLod(iChannel0, uv - vec2(offset, 0.), 0.).rgb;
    colR = ACES(colR*exposure);
    colB = ACES(colB*exposure);
    col.r = mix(colR.r, colB.r, step(.5, uv.x));
    col.b = mix(colR.b, colB.b, step(uv.x, .5));
    
    float t = sin(iTime + sin(iTime + sin(iTime)*.5));
    float vline = step(mod((uv.y + t*.08)*200., 2.), 1.);
    col *= mix(.8, 1., vline);
    
    float len = length(uv - .5);
    float vignette = smoothstep(.8, .4, len);
    col *= vignette;
    
    //col *= wave*.5 + 1.;
    
    fragColor = vec4(col, 1.);
}
