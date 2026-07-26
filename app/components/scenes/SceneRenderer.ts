import { POST_FS, QUAD_VS, SCENE_FS } from "./shaders";

export type Layer = "sky" | "far" | "near";

export type DrawState = {
  /** Seconds since start. Held constant when motion is off. */
  time: number;
  /** Per-plate lift, as a fraction of canvas height. Order: sky, far, near. */
  shift: [number, number, number];
  /** Scene weight; 0 leaves the flat base colour. */
  fade: number;
  /** 1 animating, 0 still. */
  motion: number;
};

const LAYERS: Layer[] = ["sky", "far", "near"];

/** One triangle large enough to cover the clip volume; cheaper than a quad. */
const COVER_TRIANGLE = new Float32Array([-1, -1, 3, -1, -1, 3]);

function compile(
  gl: WebGLRenderingContext,
  type: number,
  source: string
): WebGLShader | null {
  const shader = gl.createShader(type);
  if (!shader) return null;

  gl.shaderSource(shader, source);
  gl.compileShader(shader);

  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    if (process.env.NODE_ENV !== "production") {
      console.error("Scene shader failed:", gl.getShaderInfoLog(shader));
    }
    gl.deleteShader(shader);
    return null;
  }
  return shader;
}

function link(
  gl: WebGLRenderingContext,
  fragmentSource: string
): WebGLProgram | null {
  const vs = compile(gl, gl.VERTEX_SHADER, QUAD_VS);
  const fs = compile(gl, gl.FRAGMENT_SHADER, fragmentSource);
  if (!vs || !fs) return null;

  const program = gl.createProgram();
  if (!program) return null;

  gl.attachShader(program, vs);
  gl.attachShader(program, fs);
  gl.bindAttribLocation(program, 0, "aPos");
  gl.linkProgram(program);

  // Attached shaders stay alive until the program is deleted, so they can be
  // released as soon as the link succeeds.
  gl.deleteShader(vs);
  gl.deleteShader(fs);

  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    if (process.env.NODE_ENV !== "production") {
      console.error("Scene program failed:", gl.getProgramInfoLog(program));
    }
    gl.deleteProgram(program);
    return null;
  }
  return program;
}

/**
 * Two-pass renderer for the hero backdrop.
 *
 * Takes the three artwork plates as textures, composites them with parallax
 * and the world effects into an offscreen target, then runs the tube pass over
 * that result on the way to the screen. Splitting it in two is what keeps the
 * chromatic aberration affordable — it costs three samples of one composited
 * texture instead of three samples of every plate.
 *
 * The plates arrive as already-decoded <img> elements rather than being
 * fetched here, so next/image keeps choosing the resolution and the DOM copies
 * remain as a fallback if any of this fails.
 */
export class SceneRenderer {
  private gl: WebGLRenderingContext;
  private scenePass: WebGLProgram;
  private postPass: WebGLProgram;
  private buffer: WebGLBuffer;

  private textures = new Map<Layer, WebGLTexture>();
  private target: WebGLTexture | null = null;
  private framebuffer: WebGLFramebuffer | null = null;

  private width = 0;
  private height = 0;
  private scanPeriod = 2;
  private maxTexture: number;
  private scratch: HTMLCanvasElement | null = null;
  private lost = false;

  private constructor(
    gl: WebGLRenderingContext,
    scenePass: WebGLProgram,
    postPass: WebGLProgram,
    buffer: WebGLBuffer
  ) {
    this.gl = gl;
    this.scenePass = scenePass;
    this.postPass = postPass;
    this.buffer = buffer;
    this.maxTexture = gl.getParameter(gl.MAX_TEXTURE_SIZE) as number;
  }

  static create(canvas: HTMLCanvasElement): SceneRenderer | null {
    const attributes: WebGLContextAttributes = {
      alpha: false,
      antialias: false,
      depth: false,
      stencil: false,
      preserveDrawingBuffer: false,
      powerPreference: "low-power",
    };

    const gl = (canvas.getContext("webgl2", attributes) ??
      canvas.getContext("webgl", attributes)) as WebGLRenderingContext | null;
    if (!gl) return null;

    const scenePass = link(gl, SCENE_FS);
    const postPass = link(gl, POST_FS);
    const buffer = gl.createBuffer();
    if (!scenePass || !postPass || !buffer) return null;

    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, COVER_TRIANGLE, gl.STATIC_DRAW);
    gl.enableVertexAttribArray(0);
    gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);

    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 0);
    gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, 0);
    gl.disable(gl.DEPTH_TEST);
    gl.disable(gl.BLEND);

    return new SceneRenderer(gl, scenePass, postPass, buffer);
  }

  get isLost() {
    return this.lost;
  }

  markLost() {
    this.lost = true;
  }

  get isReady() {
    return !this.lost && this.textures.size === LAYERS.length;
  }

  /**
   * Uploads a decoded plate. Oversized sources are stepped down through a 2D
   * canvas first — a driver limit is a hard failure rather than a soft one, and
   * it is reachable on older mobile GPUs where MAX_TEXTURE_SIZE is 2048 but
   * next/image has handed back something wider.
   */
  upload(layer: Layer, image: HTMLImageElement) {
    if (this.lost) return;
    const gl = this.gl;

    let texture = this.textures.get(layer) ?? null;
    if (!texture) {
      texture = gl.createTexture();
      if (!texture) return;
      this.textures.set(layer, texture);
    }

    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);

    const source = this.fit(image);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, source);
  }

  private fit(image: HTMLImageElement): TexImageSource {
    const limit = this.maxTexture;
    const { naturalWidth: w, naturalHeight: h } = image;
    if (w <= limit && h <= limit) return image;

    const scale = Math.min(limit / w, limit / h);
    const canvas = (this.scratch ??= document.createElement("canvas"));
    canvas.width = Math.max(1, Math.floor(w * scale));
    canvas.height = Math.max(1, Math.floor(h * scale));

    const ctx = canvas.getContext("2d");
    if (!ctx) return image;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(image, 0, 0, canvas.width, canvas.height);
    return canvas;
  }

  /** Sizes in physical pixels. `scanPeriod` is also physical pixels. */
  resize(width: number, height: number, scanPeriod: number) {
    if (this.lost) return;
    this.scanPeriod = scanPeriod;
    if (width === this.width && height === this.height) return;

    const gl = this.gl;
    this.width = width;
    this.height = height;

    if (this.target) gl.deleteTexture(this.target);
    if (this.framebuffer) gl.deleteFramebuffer(this.framebuffer);

    this.target = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, this.target);
    gl.texImage2D(
      gl.TEXTURE_2D,
      0,
      gl.RGBA,
      width,
      height,
      0,
      gl.RGBA,
      gl.UNSIGNED_BYTE,
      null
    );
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);

    this.framebuffer = gl.createFramebuffer();
    gl.bindFramebuffer(gl.FRAMEBUFFER, this.framebuffer);
    gl.framebufferTexture2D(
      gl.FRAMEBUFFER,
      gl.COLOR_ATTACHMENT0,
      gl.TEXTURE_2D,
      this.target,
      0
    );
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
  }

  draw(state: DrawState, config: { plateAspect: number; horizonV: number; floor: [number, number, number]; base: [number, number, number] }) {
    if (!this.isReady || !this.framebuffer || this.width === 0) return;
    const gl = this.gl;

    gl.bindBuffer(gl.ARRAY_BUFFER, this.buffer);
    gl.enableVertexAttribArray(0);
    gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);

    // ---- scene ----
    gl.bindFramebuffer(gl.FRAMEBUFFER, this.framebuffer);
    gl.viewport(0, 0, this.width, this.height);
    gl.useProgram(this.scenePass);

    LAYERS.forEach((layer, unit) => {
      gl.activeTexture(gl.TEXTURE0 + unit);
      gl.bindTexture(gl.TEXTURE_2D, this.textures.get(layer)!);
    });
    this.int(this.scenePass, "uSky", 0);
    this.int(this.scenePass, "uFar", 1);
    this.int(this.scenePass, "uNear", 2);

    this.vec2(this.scenePass, "uRes", this.width, this.height);
    this.float(this.scenePass, "uPlateAspect", config.plateAspect);
    this.float(this.scenePass, "uHorizonV", config.horizonV);
    this.float(this.scenePass, "uTime", state.time);
    this.float(this.scenePass, "uMotion", state.motion);
    this.vec3(this.scenePass, "uShift", ...state.shift);
    this.vec3(this.scenePass, "uFloor", ...config.floor);

    gl.drawArrays(gl.TRIANGLES, 0, 3);

    // ---- tube ----
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    gl.viewport(0, 0, this.width, this.height);
    gl.useProgram(this.postPass);

    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, this.target);
    this.int(this.postPass, "uScene", 0);

    this.vec2(this.postPass, "uRes", this.width, this.height);
    this.float(this.postPass, "uScan", this.scanPeriod);
    this.float(this.postPass, "uTime", state.time);
    this.float(this.postPass, "uMotion", state.motion);
    this.float(this.postPass, "uFade", state.fade);
    this.vec3(this.postPass, "uBase", ...config.base);

    gl.drawArrays(gl.TRIANGLES, 0, 3);
  }

  dispose() {
    const gl = this.gl;
    this.textures.forEach((texture) => gl.deleteTexture(texture));
    this.textures.clear();
    if (this.target) gl.deleteTexture(this.target);
    if (this.framebuffer) gl.deleteFramebuffer(this.framebuffer);
    gl.deleteBuffer(this.buffer);
    gl.deleteProgram(this.scenePass);
    gl.deleteProgram(this.postPass);
    this.lost = true;
  }

  // Uniform locations are looked up per call. At two draws a frame and a
  // handful of uniforms each, the map lookup inside the driver costs less than
  // the bookkeeping a cache would need across program switches.
  private locate(program: WebGLProgram, name: string) {
    return this.gl.getUniformLocation(program, name);
  }
  private int(program: WebGLProgram, name: string, v: number) {
    this.gl.uniform1i(this.locate(program, name), v);
  }
  private float(program: WebGLProgram, name: string, v: number) {
    this.gl.uniform1f(this.locate(program, name), v);
  }
  private vec2(program: WebGLProgram, name: string, x: number, y: number) {
    this.gl.uniform2f(this.locate(program, name), x, y);
  }
  private vec3(
    program: WebGLProgram,
    name: string,
    x: number,
    y: number,
    z: number
  ) {
    this.gl.uniform3f(this.locate(program, name), x, y, z);
  }
}
