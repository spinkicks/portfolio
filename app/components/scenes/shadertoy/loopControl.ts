export class ShaderLoadAttempt {
  private controller: AbortController | null = null;
  private generation = 0;
  private closed = false;

  /** Abort any in-flight load and open a new attempt. */
  next(): { generation: number; signal: AbortSignal } | null {
    if (this.closed) return null;
    this.controller?.abort();
    this.controller = new AbortController();
    this.generation += 1;
    return { generation: this.generation, signal: this.controller.signal };
  }

  /** Abort the active load without starting another (context lost, unmount). */
  abort() {
    this.controller?.abort();
    this.controller = null;
    this.generation += 1;
  }

  isCurrent(generation: number) {
    return !this.closed && generation === this.generation;
  }

  close() {
    this.closed = true;
    this.abort();
  }
}

/**
 * rAF wrapper that cannot stack callbacks: a frame is either scheduled, running,
 * or idle. `wake` is a no-op while scheduled or running; the running tick
 * returns whether to schedule the next frame after it finishes.
 */
export class RafScheduler {
  private handle = 0;
  private scheduled = false;
  private running = false;

  constructor(
    private readonly raf: (cb: FrameRequestCallback) => number = (cb) =>
      requestAnimationFrame(cb),
    private readonly caf: (id: number) => void = (id) => cancelAnimationFrame(id)
  ) {}

  get busy() {
    return this.scheduled || this.running;
  }

  park() {
    if (!this.scheduled) return;
    this.caf(this.handle);
    this.handle = 0;
    this.scheduled = false;
  }

  wake(tick: (now: number) => boolean) {
    if (this.scheduled || this.running) return;
    this.scheduled = true;
    this.handle = this.raf((now) => {
      this.handle = 0;
      this.scheduled = false;
      this.running = true;
      let cont = false;
      try {
        cont = tick(now);
      } finally {
        this.running = false;
      }
      if (cont) this.wake(tick);
    });
  }
}
