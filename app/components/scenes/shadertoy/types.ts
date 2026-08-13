export type BufferId = "A" | "B" | "C" | "D";
export type PassId = BufferId | "image";

export type Filter = "linear" | "nearest" | "mipmap";
export type Wrap = "repeat" | "clamp";

export type Channel =
  | { kind: "buffer"; buffer: BufferId; filter?: Filter; wrap?: Wrap }
  | { kind: "texture"; url: string; filter?: Filter; wrap?: Wrap; vflip?: boolean }
  /** 256x3 key state map. Zero-filled unless the spec opts into input. */
  | { kind: "keyboard" }
  /**
   * Stand-in for a Shadertoy music input: a 512x2 texture holding an empty
   * spectrum and a centred, flat waveform. Leaving the sampler unbound instead
   * would read as a hard -0.5 on the waveform row and permanently skew any
   * shader that reacts to it.
   */
  | { kind: "silence" };

export type PassSpec = {
  id: PassId;
  /** Path under /public. Fetched rather than bundled: the larger of these is
   *  65k characters, which has no business sitting in the JS payload. */
  url: string;
  channels?: Partial<Record<0 | 1 | 2 | 3, Channel>>;
  /** Fixed render-target size. Omitted buffers follow `bufferScale` × canvas. */
  width?: number;
  height?: number;
  /** Sampling for this pass's ping-pong targets. Defaults to linear. */
  filter?: Filter;
};

export type ShaderSpec = {
  name: string;
  credit: { author: string; title: string; url: string; license: string };
  commonUrl?: string;
  /** Buffer passes in execution order; the image pass runs last. */
  passes: PassSpec[];
  /** Buffers render at this fraction of the canvas. Raymarchers get expensive
   *  fast, and the image pass resamples the result anyway. */
  bufferScale?: number;
  /** Inserted before the Common tab. */
  defines?: string[];
  /**
   * Inserted after the Common tab. Both of these shaders declare their feature
   * switches inside Common itself, so turning one off means undefining it
   * downstream rather than defining it upstream.
   */
  overrides?: string[];
};
