/* eslint-disable no-magic-numbers */
type TrackId = string;

interface JukeboxOpts {
  crossfadeSec?: number; // when switching tracks
  fadeOutSec?: number;   // for pause/stop
}

export class Jukebox {
  private ctx: AudioContext;
  private master: GainNode;
  private tracks = new Map<TrackId, AudioBuffer>();

  private selectedId: TrackId | null = null;

  // "Current" playback state
  private curSrc: AudioBufferSourceNode | null = null;
  private curGain: GainNode | null = null;
  private curStartedAt = 0;   // ctx.currentTime when current source started
  private curStartOffset = 0; // seconds into buffer when started

  // When paused, we store the offset here so play() can resume
  private pausedOffset = 0;
  private isPaused = false;

  private loopEnabled = false;

  private crossfadeSec: number;
  private fadeOutSec: number;

  /* eslint-disable-next-line complexity */
  public constructor(opts: JukeboxOpts = {}) {
    /* eslint-disable-next-line
         @typescript-eslint/no-unsafe-member-access,
         @typescript-eslint/no-explicit-any */
    this.ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    this.master = this.ctx.createGain();
    this.master.connect(this.ctx.destination);

    this.crossfadeSec = Math.max(0.05, opts.crossfadeSec ?? 2.0);
    this.fadeOutSec   = Math.max(0.05, opts.fadeOutSec   ?? 0.8);

    // Some iOS devices start muted – ensure a minimal initial volume
    this.master.gain.value = 1;
  }

  public get loop(): boolean {
    return this.loopEnabled;
  }

  public set loop(value: boolean) {
    this.loopEnabled = Boolean(value);
  }

  /** Preload and decode an MP3 (or other supported codec). CORS must allow fetch. */
  public async add(id: TrackId, url: string): Promise<void> {
    const res = await fetch(url, { mode: "cors" });
    const data = await res.arrayBuffer();
    const buffer = await this.ctx.decodeAudioData(data);
    this.tracks.set(id, buffer);
  }

  /** Select a track. If another is playing, crossfade into the new one. */
  public select(id: TrackId): void {
    if (!this.tracks.has(id)) throw new Error(`Unknown track: ${id}`);
    const buffer = this.tracks.get(id)!;

    this.selectedId = id;

    if (!this.curSrc) {
      if (this.isPaused) {
        // We’ll start this on next play(); pausedOffset already set.
        return;
      }

      // Not playing; start immediately from 0.
      this.startNewSource(buffer, 0, /*fadeIn*/ this.crossfadeSec);
      this.isPaused = false;
      return;
    }

    this.selectInternal(buffer, id);
  }

  /** Start or resume the selected track. */
  public async play(): Promise<void> {
    if (!this.selectedId) throw new Error("No track selected.");
    await this.resumeContext();

    const buffer = this.tracks.get(this.selectedId)!;

    if (this.curSrc) {
      // Already playing – nothing to do
      return;
    }

    // Resume from pausedOffset if paused; otherwise from 0
    const offset = this.isPaused ? this.pausedOffset : 0;
    this.startNewSource(buffer, offset, /*fadeIn*/ 0.12);
    this.isPaused = false;
  }

  /** Pause with a short fade and remember position for resume. */
  public pause(): void {
    if (!this.curSrc || !this.curGain) {
      // Nothing to pause
      return;
    }
    const now = this.ctx.currentTime;
    const fade = this.fadeOutSec;

    // Compute current playback position
    const elapsed = now - this.curStartedAt;
    this.pausedOffset = this.curStartOffset + Math.max(0, elapsed);
    // Clamp to buffer length
    const buf = this.curSrc.buffer!;
    this.pausedOffset = Math.min(this.pausedOffset, buf.duration);

    // Fade out then stop
    const g = this.curGain.gain;
    g.setValueAtTime(g.value, now);
    g.linearRampToValueAtTime(0, now + fade);

    const src = this.curSrc;
    src.stop(now + fade);

    // Clear current refs and mark paused
    this.curSrc = null;
    this.curGain = null;
    this.curStartedAt = 0;
    this.isPaused = true;
  }

  /** Stop with fade and reset position to start. */
  public stop(): void {
    if (this.curSrc && this.curGain) {
      const now = this.ctx.currentTime;
      const fade = this.fadeOutSec;
      const g = this.curGain.gain;
      g.setValueAtTime(g.value, now);
      g.linearRampToValueAtTime(0, now + fade);
      this.curSrc.stop(now + fade);
    }
    this.curSrc = null;
    this.curGain = null;
    this.curStartedAt = 0;
    this.curStartOffset = 0;
    this.pausedOffset = 0;
    this.isPaused = false;
  }

  /** Optional: overall volume 0..1 */
  public setVolume(v: number) {
    const now = this.ctx.currentTime;
    this.master.gain.setValueAtTime(this.master.gain.value, now);
    this.master.gain.linearRampToValueAtTime(
      Math.min(1, Math.max(0, v)),
      now + 0.05
    );
  }

  /** Must be called from a user gesture at least once on Safari/iOS */
  public async resumeContext(): Promise<void> {
    if (this.ctx.state !== "running") await this.ctx.resume();
  }

  private selectInternal(buffer: AudioBuffer, id: string) {
    // Crossfade from current source to the new one
    const now = this.ctx.currentTime;
    const fade = this.crossfadeSec;

    const newGain = this.ctx.createGain();
    newGain.gain.setValueAtTime(0, now);

    const newSrc = this.ctx.createBufferSource();
    newSrc.buffer = buffer;
    newSrc.connect(newGain).connect(this.master);
    newSrc.start(now);

    // Fade in the new, fade out the old
    newGain.gain.linearRampToValueAtTime(1, now + fade);

    if (this.curGain) {
      const currentGain = this.curGain.gain;
      // Ensure we start from current value
      const currentVal = currentGain.value;
      currentGain.setValueAtTime(currentVal, now);
      currentGain.linearRampToValueAtTime(0, now + fade);
    }

    // Schedule old stop
    const oldSrc = this.curSrc!;
    oldSrc.stop(now + fade);

    // Swap references
    this.curSrc = newSrc;
    this.curGain = newGain;
    this.curStartedAt = now;
    this.curStartOffset = 0;
    this.isPaused = false;

    // Cleanup when new ends
    this.attachSourceHandlers(newSrc, buffer, id);
  }

  /** Helper to create + start a source with an initial fade-in. */
  private startNewSource(
    buffer: AudioBuffer,
    offsetSec: number,
    fadeInSec: number,
    trackId: TrackId | null = this.selectedId
  ) {
    const now = this.ctx.currentTime;

    const gain = this.ctx.createGain();
    if (fadeInSec > 0) {
      gain.gain.setValueAtTime(0, now);
      gain.gain.linearRampToValueAtTime(1, now + fadeInSec);
    } else {
      gain.gain.value = 1;
    }

    const src = this.ctx.createBufferSource();
    src.buffer = buffer;
    src.connect(gain).connect(this.master);
    src.start(now, offsetSec);

    // Track state
    this.curSrc = src;
    this.curGain = gain;
    this.curStartedAt = now;
    this.curStartOffset = offsetSec;

    this.attachSourceHandlers(src, buffer, trackId);
  }

  private attachSourceHandlers(
    src: AudioBufferSourceNode,
    buffer: AudioBuffer,
    trackId: TrackId | null
  ) {
    src.onended = () => {
      if (this.curSrc !== src) return;

      const isSameTrack = () => trackId && this.selectedId === trackId;
      const shouldLoop = () => this.loopEnabled && !this.isPaused && isSameTrack();

      if (shouldLoop()) {
        this.startNewSource(buffer, 0, 0, trackId);
        return;
      }

      this.clearPlaybackState();
    };
  }

  private clearPlaybackState() {
    this.curSrc = null;
    this.curGain = null;
    this.curStartedAt = 0;
    this.curStartOffset = 0;
    this.pausedOffset = 0;
    this.isPaused = false;
  }
}
