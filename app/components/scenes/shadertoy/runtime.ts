/**
 * A small Shadertoy-compatible runtime.
 *
 * Shadertoy shaders are not single fragment programs. They are a graph of
 * passes writing into named buffers, several of which read their own previous
 * frame, plus a shared "Common" tab pasted in front of every stage. Porting one
 * by hand means reproducing that graph; this runs it directly instead, so the
 * GLSL in public/shaders stays byte-identical to the original and can be
 * diffed against the source it came from.
 *
 * WebGL2 only, deliberately. These shaders use texelFetch, array constructors
 * and GLSL ES 3.00 syntax that has no WebGL1 equivalent worth emulating, so a
 * missing context is a clean "don't run this" rather than a degraded path.
 */

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

const PRELUDE = `#version 300 es
precision highp float;
precision highp int;
precision highp sampler2D;

uniform vec3      iResolution;
uniform float     iTime;
uniform float     iDriveTime;
uniform float     iTimeDelta;
uniform float     iFrameRate;
uniform int       iFrame;
uniform float     iChannelTime[4];
uniform vec3      iChannelResolution[4];
uniform vec4      iMouse;
uniform vec4      iDate;
uniform float     iSampleRate;
uniform sampler2D iChannel0;
uniform sampler2D iChannel1;
uniform sampler2D iChannel2;
uniform sampler2D iChannel3;

out vec4 st_FragColor;
`;

const EPILOGUE = `
void main() {
  vec4 color = vec4(0.0, 0.0, 0.0, 1.0);
  mainImage(color, gl_FragCoord.xy);
  st_FragColor = color;
}
`;

const COVER_TRIANGLE = new Float32Array([-1, -1, 3, -1, -1, 3]);

const CHANNELS = [0, 1, 2, 3] as const;

type CompiledPass = {
  id: PassId;
  program: WebGLProgram;
  channels: (Channel | null)[];
  uniforms: Map<string, WebGLUniformLocation | null>;
};

/** Read and write halves of a buffer, swapped after the pass that owns it. */
type PingPong = {
  read: WebGLTexture;
  write: WebGLTexture;
  fbo: WebGLFramebuffer;
};

function compileStage(
  gl: WebGL2RenderingContext,
  type: number,
  source: string,
  label: string
): WebGLShader | null {
  const shader = gl.createShader(type);
  if (!shader) return null;
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    if (process.env.NODE_ENV !== "production") {
      const log = gl.getShaderInfoLog(shader) ?? "";
      console.error(`[shadertoy] ${label} failed to compile:\n${log}`);
      // Line numbers in the log count the prelude, so echo the offending lines.
      const lines = source.split("\n");
      for (const m of log.matchAll(/(\d+):(\d+)/g)) {
        const n = Number(m[2]);
        if (n > 0 && n <= lines.length) console.error(`  ${n}| ${lines[n - 1]}`);
      }
    }
    gl.deleteShader(shader);
    return null;
  }
  return shader;
}

const VERTEX_SOURCE = `#version 300 es
in vec2 aPos;
void main() { gl_Position = vec4(aPos, 0.0, 1.0); }
`;

export class ShaderToyRuntime {
  private gl: WebGL2RenderingContext;
  private spec: ShaderSpec;
  private quad: WebGLBuffer;
  private vao: WebGLVertexArrayObject;
  private passes: CompiledPass[] = [];
  private buffers = new Map<BufferId, PingPong>();
  private textures = new Map<string, { tex: WebGLTexture; w: number; h: number }>();
  private keyboard: WebGLTexture | null = null;
  private keyboardData = new Uint8Array(256 * 3 * 4);
  private silence: WebGLTexture | null = null;
  private format: number;

  private width = 0;
  private height = 0;
  private bufferWidth = 0;
  private bufferHeight = 0;
  private frameIndex = 0;
  private lastTime = 0;
  private dead = false;

  private constructor(
    gl: WebGL2RenderingContext,
    spec: ShaderSpec,
    quad: WebGLBuffer,
    vao: WebGLVertexArrayObject,
    format: number
  ) {
    this.gl = gl;
    this.spec = spec;
    this.quad = quad;
    this.vao = vao;
    this.format = format;
  }

  static async create(
    canvas: HTMLCanvasElement,
    spec: ShaderSpec,
    signal?: AbortSignal
  ): Promise<ShaderToyRuntime | null> {
    const gl = canvas.getContext("webgl2", {
      alpha: false,
      antialias: false,
      depth: false,
      stencil: false,
      preserveDrawingBuffer: false,
      powerPreference: "high-performance",
    });
    if (!gl) return null;

    // Floating point buffers: these shaders carry values well above 1.0 between
    // passes and only tonemap at the end. On RGBA8 the sun and the bloom clip
    // to flat white.
    //
    // Full float rather than half, because a buffer here is not only a colour
    // target. Sunset Drive keeps its game state in one and integrates the
    // odometer across frames (`timeAccumulated += iTimeDelta`), so the
    // accumulator is only ever as precise as the format it round-trips
    // through. Half float carries ~3 decimal digits, and once the running
    // total is large enough that one frame's delta falls below half a
    // representable step, the add rounds back to where it started and the
    // value sticks there permanently. The car simply stops. It scales with
    // refresh rate, since a shorter frame is a smaller delta: 51s at 60Hz,
    // 14s at 144Hz. Full float pushes the same stall past a day.
    //
    // RGBA32F needs a second extension to be filterable; without it a LINEAR
    // sampler renders the texture incomplete, i.e. black. Fall back rather
    // than trade a freeze for a blank screen.
    const canFloat = !!gl.getExtension("EXT_color_buffer_float");
    const canFilterFloat = !!gl.getExtension("OES_texture_float_linear");
    const canHalf = canFloat || !!gl.getExtension("EXT_color_buffer_half_float");
    const format =
      canFloat && canFilterFloat
        ? gl.RGBA32F
        : canHalf
          ? gl.RGBA16F
          : gl.RGBA8;

    const quad = gl.createBuffer();
    const vao = gl.createVertexArray();
    if (!quad || !vao) return null;

    gl.bindVertexArray(vao);
    gl.bindBuffer(gl.ARRAY_BUFFER, quad);
    gl.bufferData(gl.ARRAY_BUFFER, COVER_TRIANGLE, gl.STATIC_DRAW);
    gl.enableVertexAttribArray(0);
    gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);
    gl.bindVertexArray(null);

    const runtime = new ShaderToyRuntime(gl, spec, quad, vao, format);
    const ok = await runtime.load(signal);
    if (!ok) {
      runtime.dispose();
      return null;
    }
    return runtime;
  }

  private async load(signal?: AbortSignal): Promise<boolean> {
    const gl = this.gl;
    const spec = this.spec;

    const grab = async (url: string) => {
      const res = await fetch(url, { signal });
      if (!res.ok) throw new Error(`${url} -> ${res.status}`);
      return res.text();
    };

    let common = "";
    const bodies: string[] = [];
    try {
      const fetched = await Promise.all([
        spec.commonUrl ? grab(spec.commonUrl) : Promise.resolve(""),
        ...spec.passes.map((p) => grab(p.url)),
      ]);
      common = fetched[0];
      bodies.push(...fetched.slice(1));
    } catch (err) {
      // An abort is the caller unmounting mid-load, which React does on every
      // mount in development. Not a failure worth shouting about.
      if (process.env.NODE_ENV !== "production" && !signal?.aborted) {
        console.error("[shadertoy] source fetch failed", err);
      }
      return false;
    }
    if (signal?.aborted) return false;

    const vs = compileStage(gl, gl.VERTEX_SHADER, VERTEX_SOURCE, "vertex");
    if (!vs) return false;

    const defines = (spec.defines ?? []).map((d) => `#define ${d}`).join("\n");
    const overrides = (spec.overrides ?? []).join("\n");

    for (let i = 0; i < spec.passes.length; i++) {
      const pass = spec.passes[i];
      const source = [PRELUDE, defines, common, overrides, bodies[i], EPILOGUE].join("\n");
      const fs = compileStage(gl, gl.FRAGMENT_SHADER, source, `${spec.name}:${pass.id}`);
      if (!fs) {
        gl.deleteShader(vs);
        return false;
      }

      const program = gl.createProgram();
      if (!program) return false;
      gl.attachShader(program, vs);
      gl.attachShader(program, fs);
      gl.bindAttribLocation(program, 0, "aPos");
      gl.linkProgram(program);
      gl.deleteShader(fs);

      if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
        if (process.env.NODE_ENV !== "production") {
          console.error(`[shadertoy] link failed ${pass.id}`, gl.getProgramInfoLog(program));
        }
        gl.deleteProgram(program);
        gl.deleteShader(vs);
        return false;
      }

      const channels = CHANNELS.map((c) => pass.channels?.[c] ?? null);
      this.passes.push({ id: pass.id, program, channels, uniforms: new Map() });

      if (pass.id !== "image") this.buffers.set(pass.id, null as unknown as PingPong);
    }
    gl.deleteShader(vs);

    // Every distinct image referenced by any channel, loaded once.
    const urls = new Set<string>();
    let needsKeyboard = false;
    let needsSilence = false;
    for (const pass of this.passes) {
      for (const ch of pass.channels) {
        if (ch?.kind === "texture") urls.add(ch.url);
        if (ch?.kind === "keyboard") needsKeyboard = true;
        if (ch?.kind === "silence") needsSilence = true;
      }
    }

    try {
      await Promise.all(
        [...urls].map(async (url) => {
          const ch = this.findChannel(url);
          const image = await loadImage(url, signal);
          this.textures.set(url, this.uploadTexture(image, ch));
        })
      );
    } catch (err) {
      if (process.env.NODE_ENV !== "production") {
        console.error("[shadertoy] texture load failed", err);
      }
      return false;
    }
    if (signal?.aborted) return false;

    if (needsKeyboard) this.keyboard = this.makeKeyboardTexture();
    if (needsSilence) this.silence = this.makeSilenceTexture();
    return true;
  }

  private makeSilenceTexture() {
    const gl = this.gl;
    const width = 512;
    const data = new Uint8Array(width * 2 * 4);
    // Row 0 is the FFT (silent = 0). Row 1 is the waveform, which sits at the
    // midpoint when there is no signal, not at zero.
    for (let x = 0; x < width; x++) {
      const row1 = (width + x) * 4;
      data[row1] = 128;
      data[row1 + 1] = 128;
      data[row1 + 2] = 128;
      data[row1 + 3] = 255;
      data[x * 4 + 3] = 255;
    }
    const tex = gl.createTexture()!;
    gl.bindTexture(gl.TEXTURE_2D, tex);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, width, 2, 0, gl.RGBA, gl.UNSIGNED_BYTE, data);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    return tex;
  }

  private findChannel(url: string): Channel & { kind: "texture" } {
    for (const pass of this.passes) {
      for (const ch of pass.channels) {
        if (ch?.kind === "texture" && ch.url === url) return ch;
      }
    }
    return { kind: "texture", url };
  }

  private uploadTexture(
    image: HTMLImageElement,
    ch: Channel & { kind: "texture" }
  ) {
    const gl = this.gl;
    const tex = gl.createTexture()!;
    gl.bindTexture(gl.TEXTURE_2D, tex);
    // Shadertoy flips its texture inputs by default; the metadata on both of
    // these shaders says vflip, and the noise lookups care.
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, ch.vflip === false ? 0 : 1);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 0);

    const wrap = ch.wrap === "clamp" ? gl.CLAMP_TO_EDGE : gl.REPEAT;
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, wrap);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, wrap);

    if (ch.filter === "mipmap") {
      gl.generateMipmap(gl.TEXTURE_2D);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    } else {
      const f = ch.filter === "nearest" ? gl.NEAREST : gl.LINEAR;
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, f);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, f);
    }
    return { tex, w: image.naturalWidth, h: image.naturalHeight };
  }

  private makeKeyboardTexture() {
    const gl = this.gl;
    const tex = gl.createTexture()!;
    gl.bindTexture(gl.TEXTURE_2D, tex);
    gl.texImage2D(
      gl.TEXTURE_2D, 0, gl.RGBA, 256, 3, 0, gl.RGBA, gl.UNSIGNED_BYTE, this.keyboardData
    );
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
    return tex;
  }

  /** row 0 = down now, row 1 = toggle, row 2 = pressed this frame. */
  setKey(code: number, down: boolean) {
    if (!this.keyboard || code < 0 || code > 255) return;
    const d = this.keyboardData;
    const v = down ? 255 : 0;
    d[code * 4] = v;
    if (down) {
      d[(256 + code) * 4] = d[(256 + code) * 4] ? 0 : 255;
      d[(512 + code) * 4] = 255;
    }
    const gl = this.gl;
    gl.bindTexture(gl.TEXTURE_2D, this.keyboard);
    gl.texSubImage2D(gl.TEXTURE_2D, 0, 0, 0, 256, 3, gl.RGBA, gl.UNSIGNED_BYTE, d);
  }

  private allocate(id: BufferId, width: number, height: number): PingPong {
    const gl = this.gl;
    const make = () => {
      const tex = gl.createTexture()!;
      gl.bindTexture(gl.TEXTURE_2D, tex);
      gl.texStorage2D(gl.TEXTURE_2D, 1, this.format, width, height);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
      return tex;
    };
    const read = make();
    const write = make();
    const fbo = gl.createFramebuffer()!;

    // Both halves start black, or the first frame of a feedback buffer samples
    // whatever the driver left in memory.
    for (const tex of [read, write]) {
      gl.bindFramebuffer(gl.FRAMEBUFFER, fbo);
      gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, tex, 0);
      gl.clearColor(0, 0, 0, 1);
      gl.clear(gl.COLOR_BUFFER_BIT);
    }
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    return { read, write, fbo };
  }

  resize(width: number, height: number) {
    if (this.dead || (width === this.width && height === this.height)) return;
    const gl = this.gl;
    this.width = width;
    this.height = height;

    const scale = this.spec.bufferScale ?? 1;
    this.bufferWidth = Math.max(1, Math.round(width * scale));
    this.bufferHeight = Math.max(1, Math.round(height * scale));

    for (const [id, pp] of this.buffers) {
      if (pp) {
        gl.deleteTexture(pp.read);
        gl.deleteTexture(pp.write);
        gl.deleteFramebuffer(pp.fbo);
      }
      this.buffers.set(id, this.allocate(id, this.bufferWidth, this.bufferHeight));
    }
    // A feedback buffer that suddenly changes size has garbage history.
    this.frameIndex = 0;
  }

  private uniform(pass: CompiledPass, name: string) {
    if (!pass.uniforms.has(name)) {
      pass.uniforms.set(name, this.gl.getUniformLocation(pass.program, name));
    }
    return pass.uniforms.get(name) ?? null;
  }

  /** `time` in seconds; `driveTime` defaults to `time` for non-drive callers. */
  frame(time: number, driveTime = time): boolean {
    if (this.dead || this.width === 0) return !this.dead;
    const gl = this.gl;

    const delta = this.frameIndex === 0 ? 1 / 60 : Math.min(0.1, time - this.lastTime);
    this.lastTime = time;

    gl.bindVertexArray(this.vao);
    gl.disable(gl.DEPTH_TEST);
    gl.disable(gl.BLEND);

    for (const pass of this.passes) {
      const toScreen = pass.id === "image";
      const target = toScreen ? null : this.buffers.get(pass.id as BufferId)!;
      const w = toScreen ? this.width : this.bufferWidth;
      const h = toScreen ? this.height : this.bufferHeight;

      if (target) {
        gl.bindFramebuffer(gl.FRAMEBUFFER, target.fbo);
        gl.framebufferTexture2D(
          gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, target.write, 0
        );
      } else {
        gl.bindFramebuffer(gl.FRAMEBUFFER, null);
      }
      gl.viewport(0, 0, w, h);
      gl.useProgram(pass.program);

      const chRes = new Float32Array(12);
      for (const unit of CHANNELS) {
        const ch = pass.channels[unit];
        gl.activeTexture(gl.TEXTURE0 + unit);

        let size: [number, number] = [0, 0];
        if (!ch) {
          gl.bindTexture(gl.TEXTURE_2D, null);
        } else if (ch.kind === "buffer") {
          // Always the read half: a pass reading the buffer it writes is
          // reading last frame, which is the whole point of the feedback.
          const src = this.buffers.get(ch.buffer);
          gl.bindTexture(gl.TEXTURE_2D, src ? src.read : null);
          if (src) size = [this.bufferWidth, this.bufferHeight];
        } else if (ch.kind === "texture") {
          const t = this.textures.get(ch.url);
          gl.bindTexture(gl.TEXTURE_2D, t?.tex ?? null);
          if (t) size = [t.w, t.h];
        } else if (ch.kind === "silence") {
          gl.bindTexture(gl.TEXTURE_2D, this.silence);
          size = [512, 2];
        } else {
          gl.bindTexture(gl.TEXTURE_2D, this.keyboard);
          size = [256, 3];
        }
        gl.uniform1i(this.uniform(pass, `iChannel${unit}`), unit);
        chRes[unit * 3] = size[0];
        chRes[unit * 3 + 1] = size[1];
        chRes[unit * 3 + 2] = 1;
      }

      gl.uniform3f(this.uniform(pass, "iResolution"), w, h, 1);
      gl.uniform1f(this.uniform(pass, "iTime"), time);
      gl.uniform1f(this.uniform(pass, "iDriveTime"), driveTime);
      gl.uniform1f(this.uniform(pass, "iTimeDelta"), delta);
      gl.uniform1f(this.uniform(pass, "iFrameRate"), 1 / Math.max(delta, 1e-4));
      gl.uniform1i(this.uniform(pass, "iFrame"), this.frameIndex);
      gl.uniform4f(this.uniform(pass, "iMouse"), 0, 0, 0, 0);
      gl.uniform1f(this.uniform(pass, "iSampleRate"), 44100);
      gl.uniform3fv(this.uniform(pass, "iChannelResolution[0]"), chRes);
      gl.uniform1fv(
        this.uniform(pass, "iChannelTime[0]"),
        new Float32Array([time, time, time, time])
      );
      const now = new Date();
      gl.uniform4f(
        this.uniform(pass, "iDate"),
        now.getFullYear(),
        now.getMonth(),
        now.getDate(),
        now.getHours() * 3600 + now.getMinutes() * 60 + now.getSeconds()
      );

      gl.drawArrays(gl.TRIANGLES, 0, 3);

      if (target) {
        const t = target.read;
        target.read = target.write;
        target.write = t;
      }
    }

    gl.bindVertexArray(null);
    // Clear the one-frame "pressed" row now that every pass has seen it.
    if (this.keyboard) {
      let touched = false;
      for (let i = 512 * 4; i < this.keyboardData.length; i += 4) {
        if (this.keyboardData[i]) {
          this.keyboardData[i] = 0;
          touched = true;
        }
      }
      if (touched) {
        gl.bindTexture(gl.TEXTURE_2D, this.keyboard);
        gl.texSubImage2D(
          gl.TEXTURE_2D, 0, 0, 0, 256, 3, gl.RGBA, gl.UNSIGNED_BYTE, this.keyboardData
        );
      }
    }

    this.frameIndex++;
    return true;
  }

  get isDead() {
    return this.dead;
  }

  markDead() {
    this.dead = true;
  }

  dispose() {
    const gl = this.gl;
    for (const pass of this.passes) gl.deleteProgram(pass.program);
    for (const pp of this.buffers.values()) {
      if (!pp) continue;
      gl.deleteTexture(pp.read);
      gl.deleteTexture(pp.write);
      gl.deleteFramebuffer(pp.fbo);
    }
    for (const t of this.textures.values()) gl.deleteTexture(t.tex);
    if (this.keyboard) gl.deleteTexture(this.keyboard);
    if (this.silence) gl.deleteTexture(this.silence);
    gl.deleteBuffer(this.quad);
    gl.deleteVertexArray(this.vao);
    this.passes = [];
    this.buffers.clear();
    this.textures.clear();
    this.dead = true;
  }
}

function loadImage(url: string, signal?: AbortSignal): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error(`image ${url}`));
    img.src = url;
    signal?.addEventListener("abort", () => reject(new Error("aborted")), { once: true });
  });
}
