import type { ShaderSpec } from "./runtime";

/**
 * Pass graphs for the two Shadertoy pieces, transcribed from each shader's own
 * channel bindings. Shadertoy names its buffers by opaque IDs: 4dXGR8 is
 * Buffer A, XsXGR8 is B, 4sXGR8 is C, XdfGR8 is D, which is how the wiring
 * below was read off the originals.
 *
 * Both are CC BY-NC-SA 3.0. Attribution is rendered on the page, not just left
 * in a comment here.
 */

/**
 * Raymarched terrain scrolling toward the camera under a striped sun, with a
 * temporal accumulation pass smoothing the march and a bloom, aberration and
 * scanline finish.
 *
 * A -> B (blends against its own previous frame) -> image.
 */
export const SYNTHWAVE_THEME: ShaderSpec = {
  name: "synthwave-theme",
  credit: {
    author: "53",
    title: "Synthwave Theme",
    url: "https://www.shadertoy.com/view/WssBz2",
    license: "CC BY-NC-SA 3.0",
  },
  passes: [
    { id: "A", url: "/shaders/synthwave-theme/buffer-a.glsl" },
    {
      id: "B",
      url: "/shaders/synthwave-theme/buffer-b.glsl",
      channels: {
        0: { kind: "buffer", buffer: "A" },
        // Its own last frame. The neighbourhood clamp in this pass is what
        // keeps that feedback from smearing.
        1: { kind: "buffer", buffer: "B" },
      },
    },
    {
      id: "image",
      url: "/shaders/synthwave-theme/image.glsl",
      channels: {
        0: { kind: "buffer", buffer: "B" },
        // Originally a SoundCloud stream driving a horizontal shake.
        1: { kind: "silence" },
      },
    },
  ],
  // The march runs 200 steps a pixel and the temporal pass hides the shortfall,
  // so resolution is the cheapest thing to give up here.
  bufferScale: 0.75,
};

/**
 * An endless-runner built entirely in shaders: state machine, terrain, car,
 * reflections and volumetrics across four buffers.
 *
 * A (game state, feedback) -> B (render) -> C (composite) -> D -> image.
 */
export const SUNSET_DRIVE: ShaderSpec = {
  name: "sunset-drive",
  credit: {
    author: "Michal Klos (spolsh)",
    title: "Sunset Drive Unlimited",
    url: "https://www.shadertoy.com/view/wtS3W3",
    license: "CC BY-NC-SA 3.0",
  },
  commonUrl: "/shaders/sunset-drive/common.glsl",
  passes: [
    {
      id: "A",
      url: "/shaders/sunset-drive/buffer-a.glsl",
      channels: {
        0: { kind: "buffer", buffer: "A" },
        1: { kind: "keyboard" },
      },
    },
    {
      id: "B",
      url: "/shaders/sunset-drive/buffer-b.glsl",
      channels: {
        0: { kind: "buffer", buffer: "A" },
        1: {
          kind: "texture",
          url: "/shaders/media/gray-noise-small.png",
          filter: "mipmap",
          wrap: "repeat",
        },
        2: {
          kind: "texture",
          url: "/shaders/media/gray-noise-medium.png",
          filter: "mipmap",
          wrap: "repeat",
        },
      },
    },
    {
      id: "C",
      url: "/shaders/sunset-drive/buffer-c.glsl",
      channels: {
        0: { kind: "buffer", buffer: "B" },
        1: { kind: "buffer", buffer: "A", filter: "nearest" },
        3: {
          kind: "texture",
          url: "/shaders/media/organic-rgba.png",
          filter: "linear",
          wrap: "clamp",
        },
      },
    },
    {
      id: "D",
      url: "/shaders/sunset-drive/buffer-d.glsl",
      channels: { 0: { kind: "buffer", buffer: "C", filter: "nearest" } },
    },
    {
      id: "image",
      url: "/shaders/sunset-drive/image.glsl",
      channels: { 0: { kind: "buffer", buffer: "D", filter: "nearest" } },
    },
  ],
  defines: [
    // Wanted as scenery, not as a game.
    //
    // NO_CRASH alone was not enough. It stops a collision ending the run, but
    // the traffic is still there and the demo driver only half dodges it: for
    // a car in the middle lane it steers by a random amount that is often close
    // to zero, so the car drives straight through the other vehicles. Reads
    // exactly like crashing, just without the death. NO_OBSTACLES removes the
    // traffic outright, which is what actually leaves an open road.
    "NO_COINS",
    "NO_CRASH",
    "NO_OBSTACLES",
  ],
  overrides: [
    // Score, splash text and the rest of the HUD belong to the game, not to a
    // page backdrop.
    "#undef SHOW_UI",
    // Letterboxes the scene to 2.39:1 and discards everything outside it,
    // which on a full-bleed hero leaves black bands top and bottom.
    "#undef FORCED_RATIO",
    "#undef FPS_COUNTER",
  ],
  bufferScale: 0.7,
};

/**
 * Digital rain, flown through on a fixed circuit. Single pass, no channels and
 * no feedback, which is why it needs none of the buffer wiring above.
 *
 * The march is the whole cost: every pixel walks up to ITERATIONS horizontal
 * cells and checks two vertical cells in each. Behind a page of body text it
 * does not need the full depth, so the count is a macro here and the host draws
 * it at a fraction of the canvas as well.
 */
export const MATRIX_RAIN: ShaderSpec = {
  name: "matrix-rain",
  credit: {
    author: "And390",
    title: "Inside the Matrix",
    url: "https://www.shadertoy.com/view/4t3BWl",
    // Not the site default: the author waived it in the source header.
    license: "Free use, per the author",
  },
  passes: [{ id: "image", url: "/shaders/matrix-rain/image.glsl" }],
  defines: ["RAIN_ITERATIONS 20"],
};

export const SHADERS = {
  "synthwave-theme": SYNTHWAVE_THEME,
  "sunset-drive": SUNSET_DRIVE,
  "matrix-rain": MATRIX_RAIN,
} as const;

export type ShaderKey = keyof typeof SHADERS;
