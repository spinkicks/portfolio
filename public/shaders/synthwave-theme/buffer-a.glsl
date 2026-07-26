const float MAX_DIST = 300.;
const float MIN_DIST = .01;
const int MAX_STEP = 200;
const float OFFS_NORM = .1;

const float blockScale = .3;
const float speed = 12.;

const vec3 col1 = vec3(.9, .1, .7);
const vec3 col2 = vec3(.1, .2, .8);

float stripe(float y, float h, float dt)
{
 	const float e = .005;
    float t01 = fract((iTime + dt)*.1);
    h += t01*.15;
    float dh = (1. - t01)*.01;
    float mask = smoothstep(h - dh*.5, h - dh*.5 - e, y);
    mask += smoothstep(h + dh*.5, h + dh*.5 + e, y);
    return mask;
}
float sunStripes(vec2 uv)
{
	const float start = -.02;
    float delta = 2.;
    float mask = stripe(uv.y, start, 0.);
    mask *= stripe(uv.y, start, delta*1.);
    mask *= stripe(uv.y, start, delta*2.);
    mask *= stripe(uv.y, start, delta*3.);
    mask *= stripe(uv.y, start, delta*4.);
    return mask;
}
float rand21(vec2 p)
{
    return fract(sin(dot(p, vec2(1., 113.)))*43758.5453123);
}
float rand212(vec2 p)
{
    if (p.x < 2. && p.x > -3.)
        return 0.;
        
    return fract(sin(dot(p, vec2(1., 113.)))*43758.5453123);
}
float noise_value(vec2 p)
{
    vec2 ip = floor(p);
    vec2 fp = fract(p);
    float xGEy = step(fp.y, fp.x);
    float v_l = rand212(ip + vec2(0., 0.))*(1. - fp.x) +
                rand212(ip + vec2(1., 0.))*(fp.x - fp.y) +
                rand212(ip + vec2(1., 1.))*fp.y;
    float v_u = rand212(ip + vec2(0., 0.))*(1. - fp.y) +
                rand212(ip + vec2(0., 1.))*(fp.y - fp.x) +
                rand212(ip + vec2(1., 1.))*fp.x;  
    return mix(v_u, v_l, xGEy);
    
    vec2 w = fp;
    return mix(mix(rand21(ip + vec2(0., 0.)),
                   rand21(ip + vec2(1., 0.)), w.x),
               mix(rand21(ip + vec2(0., 1.)),
                   rand21(ip + vec2(1., 1.)), w.x), w.y);
}
float noise_value2(vec2 p)
{
    vec2 ip = floor(p);
    vec2 fp = fract(p);
    vec2 w = fp*fp*(3. - 2.*fp);
    return mix(mix(rand21(ip + vec2(0., 0.)),
                   rand21(ip + vec2(1., 0.)), w.x),
               mix(rand21(ip + vec2(0., 1.)),
                   rand21(ip + vec2(1., 1.)), w.x), w.y);
}
const vec3 grad3[32] = vec3[32](vec3(1., 1., 0.)/sqrt(2.), vec3(-1., 1., 0.)/sqrt(2.), vec3(1., -1., 0.)/sqrt(2.), vec3(-1., -1., 0.)/sqrt(2.),
                                vec3(1., 0., 1.)/sqrt(2.), vec3(-1., 0., 1.)/sqrt(2.), vec3(1., 0., -1.)/sqrt(2.), vec3(-1., 0., -1.)/sqrt(2.),
                                vec3(0., 1., 1.)/sqrt(2.), vec3(0., -1., 1.)/sqrt(2.), vec3(0., 1., -1.)/sqrt(2.), vec3(0., -1., -1.)/sqrt(2.),
                                vec3(1., 1., 0.)/sqrt(2.), vec3(-1., 1., 0.)/sqrt(2.), vec3(1., -1., 0.)/sqrt(2.), vec3(-1., -1., 0.)/sqrt(2.),
                                vec3(1., 0., 1.)/sqrt(2.), vec3(-1., 0., 1.)/sqrt(2.), vec3(1., 0., -1.)/sqrt(2.), vec3(-1., 0., -1.)/sqrt(2.),
                                vec3(0., 1., 1.)/sqrt(2.), vec3(0., -1., 1.)/sqrt(2.), vec3(0., 1., -1.)/sqrt(2.), vec3(0., -1., -1.)/sqrt(2.),
                                vec3(1., -1., -1.)/sqrt(3.), vec3(-1., 1., 1.)/sqrt(3.), vec3(-1., -1., 1.)/sqrt(3.), vec3(1., 1., -1.)/sqrt(3.),
                                vec3(1., 1., 1.)/sqrt(3.), vec3(-1., 1., -1.)/sqrt(3.), vec3(1., -1., 1.)/sqrt(3.), vec3(-1., -1., -1.)/sqrt(3.));
float hash13(vec3 p3)
{
	p3  = fract(p3 * .1031);
    p3 += dot(p3, p3.yzx + 33.33);
    return fract((p3.x + p3.y) * p3.z);
}
vec3 hash33(vec3 p3)
{
	return grad3[int(mod(hash13(p3)*43758., 32.))];
}
float noise_simplex(vec3 p)
{
    const vec3 C = vec3(1./3., 1./6., 1./2.);
	vec3 ip = floor(p + dot(p, C.xxx));
    vec3 d0 = p - (ip - dot(ip, C.yyy));
    vec3 g = step(d0.zxy, d0.xyz);
    vec3 l = 1. - g;
    vec3 i1 = min(g.xyz, l.yzx);
    vec3 i2 = max(g.xyz, l.yzx);
    vec3 d1 = d0 - (i1 - C.yyy);
    vec3 d2 = d0 - (i2 - C.xxx);
    vec3 d3 = d0 - (1. - C.zzz);
    vec4 m = max(vec4(0.), .5 - vec4(dot(d0, d0), dot(d1, d1), dot(d2, d2), dot(d3, d3)));
    m = m*m*m*m;
    return 107.6535*(m.x*dot(hash33(ip), d0) +
                     m.y*dot(hash33(ip + i1), d1) +
                     m.z*dot(hash33(ip + i2), d2) +
                     m.w*dot(hash33(ip + 1.), d3))*.5 + .5;
}
float fbm(vec2 p)
{
 	float sum = 0.;
    float a = 1.;
    float s = 1.;
    float v = 0.;
    for(int i = 0; i < 5; ++i)
    {
     	sum += a;
        v += noise_value2(p*s)*a;
        a *= .5;
        s *= 2.;
    }
    return v/sum;
}
float fbm(vec3 p)
{
 	float sum = 0.;
    float a = 1.;
    float s = 1.;
    float v = 0.;
    for(int i = 0; i < 4; ++i)
    {
     	sum += a;
        v += noise_simplex(p*s)*a;
        a *= .5;
        s *= 2.;
    }
    return v/sum;
}

mat2 rot(float a)
{
    float c = cos(a);
    float s = sin(a);
    return mat2(c, -s, s, c);
}
float calcHeight(vec3 p)
{
    p.z -= iTime*speed;
    float h = noise_value(p.xz*blockScale - .5)*7.;
    float mask = clamp((abs(p.x) - 5.)/10., 0., 1.);
    return h*mask;
}
float sdPlane(vec3 p, float y)
{
    float h = calcHeight(p);
    return p.y - y - h;
}
float sdSphere(vec3 p, vec3 c, float r)
{
    p -= c;
    return length(p) - r;
}
float calcDist(vec3 p)
{
    float d = 0.;
    d = sdPlane(p, 0.);
    // d = min(d, sdSphere(p, vec3(0., 20., -200), 50.));
    return d*.5;
}
float rayMarch(vec3 ro, vec3 rd)
{
    float d = 0.;
    float t = 0.;
    for(int i = 0; i < MAX_STEP; ++i)
    {
        d = calcDist(ro + rd*t);
        t += d;
        if(d < MIN_DIST || t > MAX_DIST)
        {
            break;
        }
    }
    return t;
}
vec3 calcNormal(vec3 p)
{
    vec3 d0 = vec3(calcDist(p));
    vec2 e = vec2(OFFS_NORM, 0.);
    vec3 d = vec3(calcDist(p + e.xyy), calcDist(p + e.yxy), calcDist(p + e.yyx));
    return normalize(d - d0);
}
vec3 calcRayDir(vec3 ro, vec3 c, vec2 uv, float z)
{
    vec3 f = normalize(c - ro);
    vec3 r = normalize(cross(f, vec3(0., 1., 0.)));
    vec3 u = cross(r, f);
    vec3 i = f*z + r*uv.x + u*uv.y;
    return normalize(i);
}
void mainImage( out vec4 fragColor, in vec2 fragCoord )
{
    vec2 uv = (fragCoord.xy - .5*iResolution.xy)/iResolution.y;
    vec2 m = (iMouse.xy - .5*iResolution.xy)/iResolution.xy;
    vec3 col = vec3(0.);
    vec3 ro = vec3(0., 5., 15.);
    vec3 c = vec3(0., 0., -1.);
    // c.yz *= rot(m.y*3.14/2.);
    // c.xz *= rot(m.x*6.28);
    vec3 rd = calcRayDir(ro, ro + c, uv, 1.);
    float d = rayMarch(ro, rd);
    if(d < MAX_DIST)
    {
     	vec3 p = ro + rd*d;
        vec3 normal = calcNormal(p);
        vec3 ldir1 = normalize(vec3(-.3, 1., 1.));
        vec3 ldir2 = normalize(vec3(.3, 1., -1.));
        float nl1 = max(0., dot(normal, ldir1));
        float nl2 = max(0., dot(normal, ldir2));
        
        float distMod = smoothstep(0., 100., d);
        vec3 light = mix(nl1*col1, nl2*col2, distMod)*10.;
        
        col += nl1*col1;
        col += nl2*col2*5.*distMod;
        
        p.z -= iTime*speed;
        float lineWidth = .05;
        float widthMod = smoothstep(100., 50., d)*1.5;
        vec2 fp = fract(p.xz*blockScale + .5*lineWidth + .5);
        if(fp.x < lineWidth || fp.y < lineWidth*widthMod) col = light*(2. + distMod);
    }
    else
    {
     	float sun0 = smoothstep(.25, .248, length(uv - vec2(.0, .1)));
        float mask = sunStripes(uv);
        float sun = sun0*mask;
        vec3 sunCol = 10.*mix(vec3(.6, .1, .8)*.2, vec3(1., .6, .0), smoothstep(.0, .35, uv.y));
        
        col += sun*sunCol + (1. - sun)*vec3(.6, .3, .7)*1.;
        
        float fog = smoothstep(.25, .0, uv.y);
        float n = fbm(vec3(uv*3. - vec2(0., iTime*.07), iTime*.07));
        fog *= n*((1. - sun0) + sun0*.7);
        
        col += fog*vec3(.1, .5, .9)*mix(2., 10., fog);
        
		vec2 iuv = floor(uv*16.);
        vec2 fuv = fract(uv*16.);
        vec2 starPos = rand21(iuv) + iuv;
        float starDist = length(uv*16. - starPos);
        float starRnd = rand21(iuv);
        float starSize = mix(.008, .03, starRnd);
        float star = smoothstep(starSize, starSize - .001, starDist)*step(mod(starRnd*100., 2.), .5);
        star *= (1. - sun);
        
        col += star*(sin(starRnd*100. + iTime*3.14*.5)*.5 + .5)*20.;
        
        float starDust = smoothstep(.2, .2 + .5*n, uv.y);
        starDust *= n;
        float starDustMask = noise_value2(uv*2. + .5);
        starDust *= starDustMask;
        
        col += starDust*mix(vec3(.6, .2, .6), vec3(.2, .4, .8), starDustMask)*2.5;
    }
    
    //col = vec3(noise_value(uv*8.));
    
    fragColor = vec4(col,1.0);
}
