/**
 * GLSL for the hero backdrop.
 *
 * Written against GLSL ES 1.00 so one source works on both a WebGL1 and a
 * WebGL2 context — WebGL2 accepts 1.00 shaders, and requesting it first buys
 * nothing here beyond a slightly better chance of a hardware path.
 *
 * Two passes. The scene pass composites the three artwork plates with the
 * parallax offsets and the effects that belong to the world (heat off the
 * horizon, light moving through the sun, glints along the neon ridges). The
 * post pass treats that result as something being displayed rather than
 * something being looked at directly, and applies the tube.
 */

export const QUAD_VS = /* glsl */ `
attribute vec2 aPos;
varying vec2 vUv;

void main() {
  vUv = aPos * 0.5 + 0.5;
  gl_Position = vec4(aPos, 0.0, 1.0);
}
`;

export const SCENE_FS = /* glsl */ `
precision highp float;

varying vec2 vUv;

uniform sampler2D uSky;
uniform sampler2D uFar;
uniform sampler2D uNear;

uniform vec2  uRes;          // drawing buffer size, physical px
uniform float uPlateAspect;  // source artwork aspect
uniform float uHorizonV;     // ridge line, in plate coordinates
uniform float uTime;         // seconds; held at 0 when motion is off
uniform vec3  uShift;        // per-plate lift, as a fraction of canvas height
uniform float uMotion;       // 1 animating, 0 still
uniform vec3  uFloor;        // colour below the plates

float hSpan() { return min(1.0, uPlateAspect / (uRes.x / uRes.y)); }
float wSpan() { return min(1.0, (uRes.x / uRes.y) / uPlateAspect); }

/**
 * object-fit: cover with object-position: bottom, plus a vertical lift — the
 * same framing the plates had as DOM images, so nothing shifts when the canvas
 * takes over from them.
 *
 * Past the bottom edge the plate hands back the floor colour rather than
 * transparency: each plate had an opaque floor running on beneath it, so a
 * lifted plate reveals ground instead of the layer behind.
 */
vec4 plate(sampler2D tex, vec2 sp, float shift) {
  float h = hSpan();
  float w = wSpan();

  float v = (1.0 - h) + (sp.y + shift) * h;
  if (v > 1.0) return vec4(uFloor, 1.0);

  float u = (1.0 - w) * 0.5 + sp.x * w;
  return texture2D(tex, vec2(clamp(u, 0.0, 1.0), clamp(v, 0.0, 1.0)));
}

/** Where the ridge line falls on screen, which moves as the plate lifts. */
float horizonY(float shift) {
  float h = hSpan();
  return (uHorizonV - (1.0 - h)) / h - shift;
}

/** How strongly a colour reads as neon: saturated and bright at once. */
float neon(vec3 c) {
  float mx = max(max(c.r, c.g), c.b);
  float mn = min(min(c.r, c.g), c.b);
  return smoothstep(0.16, 0.48, mx - mn) * smoothstep(0.14, 0.42, mx);
}

float hash21(vec2 p) {
  p = fract(p * vec2(123.34, 456.21));
  p += dot(p, p + 45.32);
  return fract(p.x * p.y);
}

void main() {
  // Screen point with the origin at the top left, to match how the plates were
  // laid out as DOM elements.
  vec2 sp = vec2(vUv.x, 1.0 - vUv.y);

  // Air off the warm ground. Two frequencies beating against each other, since
  // a single sine reads as a wobble rather than as heat, and falling away fast
  // above and below the ridge so the sky and the foreground stay still.
  float hz = horizonY(uShift.x);
  float heat = exp(-abs(sp.y - hz) / 0.13) * uMotion;
  vec2 warp = vec2(
    (sin(sp.y * 74.0 + uTime * 1.15) * 0.6 +
     sin(sp.y * 127.0 - uTime * 0.73) * 0.4) * 0.0018,
    sin(sp.x * 21.0 + uTime * 0.85) * 0.0008
  ) * heat;

  vec4 sky  = plate(uSky,  sp + warp,        uShift.x);
  vec4 far  = plate(uFar,  sp + warp * 0.55, uShift.y);
  vec4 near = plate(uNear, sp,               uShift.z);

  // The sun finds itself: bright and warm at once, which nothing else in the
  // frame is. Cheaper and more robust than hardcoding where it sits, and it
  // keeps working if the artwork is ever recut.
  float lum  = dot(sky.rgb, vec3(0.299, 0.587, 0.114));
  float warm = clamp((sky.r - sky.b) * 1.7, 0.0, 1.0);
  float sun  = smoothstep(0.28, 0.75, lum) * smoothstep(0.04, 0.38, warm);

  // Bands drifting up through it. Deliberately a lower frequency than the
  // banding already painted into the artwork, so the two don't beat.
  float band = sin(sp.y * 44.0 - uTime * 0.5 * uMotion);
  sky.rgb *= 1.0 - sun * 0.10 * smoothstep(-0.3, 1.0, band);
  sky.rgb += sun * vec3(1.0, 0.42, 0.16) * 0.05 *
             (0.5 + 0.5 * sin(uTime * 0.4)) * uMotion;

  // A handful of stars breathing in the dark part of the sky, well above the
  // ridge and only where the plate is already close to black.
  vec2 grid = vec2(190.0, 107.0);
  float seed = hash21(floor(sp * grid));
  float shape = 1.0 - smoothstep(0.0, 0.36, length(fract(sp * grid) - 0.5));
  float dark = (1.0 - smoothstep(0.03, 0.20, lum)) *
               (1.0 - smoothstep(hz - 0.30, hz, sp.y));
  float twinkle = 0.5 + 0.5 * sin(uTime * 1.6 + seed * 62.8);
  sky.rgb += step(0.9968, seed) * shape * dark * mix(1.0, twinkle, uMotion) * 0.6;

  // Light travelling along the ridges, faster on the near plate so the two
  // ranges don't pulse in lockstep.
  float sweep = 0.5 + 0.5 * sin(sp.x * 2.4 - uTime * 0.38);
  far.rgb  += neon(far.rgb)  * sweep * 0.05 * uMotion;
  near.rgb += neon(near.rgb) * sweep * 0.07 * uMotion;

  vec3 col = sky.rgb;
  col = mix(col, far.rgb, far.a);
  col = mix(col, near.rgb, near.a);

  gl_FragColor = vec4(col, 1.0);
}
`;

export const POST_FS = /* glsl */ `
precision highp float;

varying vec2 vUv;

uniform sampler2D uScene;
uniform vec2  uRes;    // drawing buffer size, physical px
uniform float uScan;   // scanline period, physical px
uniform float uTime;
uniform float uMotion;
uniform float uFade;   // scene weight; falls off as the hero scrolls away
uniform vec3  uBase;   // flat colour the scene settles back to

const float TAU_3 = 2.0943951;

/** Slight outward bow, as if the image sat on a curved tube face. */
vec2 barrel(vec2 uv, float k) {
  vec2 c = uv * 2.0 - 1.0;
  c *= 1.0 + k * dot(c, c);
  return c * 0.5 + 0.5;
}

void main() {
  vec2 uv = barrel(vUv, 0.022);
  vec2 d = uv - 0.5;
  float r2 = dot(d, d);

  // Convergence drifts apart toward the corners and is perfect at the centre,
  // which is how a real tube misbehaves.
  vec2 ca = d * r2 * 0.012;
  vec3 col = vec3(
    texture2D(uScene, clamp(uv + ca, 0.0, 1.0)).r,
    texture2D(uScene, clamp(uv, 0.0, 1.0)).g,
    texture2D(uScene, clamp(uv - ca, 0.0, 1.0)).b
  );

  // Line structure, locked to physical pixels so it never crawls or moirés
  // against the display.
  float line = sin(3.14159265 * uv.y * uRes.y / uScan);
  col *= 1.0 - 0.06 * line * line;

  // Aperture grille. Sub-pixel on any modern display, so it lands as a faint
  // texture rather than as visible colour fringing. Centred on 1.0 so it
  // redistributes brightness between the channels instead of removing it —
  // the three phases sum to zero, the scanlines above are the only part of
  // this pass meant to cost light.
  float px = gl_FragCoord.x;
  col *= 1.0 + 0.05 * vec3(
    sin(px * TAU_3),
    sin(px * TAU_3 + TAU_3),
    sin(px * TAU_3 + 2.0 * TAU_3)
  );

  // One bright bar working slowly down the frame, the way a camera pointed at
  // a CRT picks up the refresh.
  float roll = fract(uv.y * 0.5 - uTime * 0.06);
  col *= 1.0 + 0.03 * uMotion *
         smoothstep(0.0, 0.04, roll) * (1.0 - smoothstep(0.04, 0.15, roll));

  // Falloff is in UV, not in pixels, so a narrow viewport draws the corners in
  // over a shorter distance. Kept gentle for that reason — the scrim stack
  // over the copy column is already doing most of this work.
  col *= 1.0 - 0.42 * r2;

  // The bow pushes the corners off the source; fade them out rather than
  // smearing the edge pixels across the gap.
  vec2 over = max(vec2(0.0), abs(uv - 0.5) - 0.5);
  col = mix(col, uBase * 0.35, smoothstep(0.0, 0.008, max(over.x, over.y)));

  gl_FragColor = vec4(mix(uBase, col, uFade), 1.0);
}
`;
