const ivec2 offs[8] = ivec2[8](ivec2(-1, -1), ivec2(-1, 1), ivec2(1, 1), ivec2(1, -1),
                         ivec2(1, 0), ivec2(0, 1), ivec2(-1, 0), ivec2(0, -1));
vec3 RGB2YCoCg(vec3 col)
{
    float Y = dot(col, vec3(.25, .5, .25));
    float Co = dot(col, vec3(.5, 0., -.5)) + .5;
    float Cg = dot(col, vec3(-.25, .5, -.25)) + .5;
    return vec3(Y, Co, Cg);
}
vec3 YCoCg2RGB(vec3 col)
{
    col += vec3(0., -.5, -.5);
    float r = dot(col, vec3(1., 1., -1.));
    float g = dot(col, vec3(1., 0., 1.));
    float b = dot(col, vec3(1., -1., -1.));
    return vec3(r, g, b);
}
void mainImage( out vec4 fragColor, in vec2 fragCoord )
{
    vec2 uv = fragCoord.xy/iResolution.xy;
    vec3 new = RGB2YCoCg(texture(iChannel0, uv).rgb);
    vec3 last = RGB2YCoCg(texture(iChannel1, uv).rgb);
    vec3 avg = new;
    vec3 var = new*new;
    for(int i = 0; i < 8; i++)
    {
        vec3 fetch = RGB2YCoCg(texelFetch(iChannel0, ivec2(fragCoord) + offs[i], 0).rgb);
        avg += fetch;
        var += fetch*fetch;
    }
    avg /= 9.;
    var /= 9.;
    vec3 sigma = max(vec3(0.), var - avg*avg);
    vec3 colMin = avg - .75*sigma;
    vec3 colMax = avg + .75*sigma;
    last = clamp(last, colMin, colMax);
    fragColor = vec4(YCoCg2RGB(mix(new, last, .95)), 1.);
}
