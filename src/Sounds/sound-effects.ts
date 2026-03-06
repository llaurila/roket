/* eslint-disable no-magic-numbers */

const LOW_VOLUME = 0.33;
const SHORT_DURATION = 0.05;
const LONG_DURATION = 0.4;
const FADE_TIME_SEC = 0.05;

const clampVolume = (value: number) => Math.min(1, Math.max(0, value));

export class SoundEffects {
    private ctx: AudioContext | null = null;
    private master: GainNode | null = null;
    private volume = 1;
    private muted = false;

    public async resumeContext(): Promise<void> {
        const { ctx } = this.ensureAudioGraph();

        if (ctx.state !== "running") {
            await ctx.resume();
        }
    }

    public getVolume(): number {
        return this.volume;
    }

    public setVolume(value: number): void {
        this.volume = clampVolume(value);
        this.syncMasterVolume();
    }

    public restoreVolume(): void {
        this.muted = false;
        this.syncMasterVolume();
    }

    public mute(): void {
        this.muted = true;
        this.syncMasterVolume();
    }

    public playNotificationSound(): void {
        const HZ = 400;
        this.playOscillatorSound(HZ, SHORT_DURATION, true);
    }

    public playObjectiveClearedSound(): void {
        const HZ = 820;
        this.playOscillatorSound(HZ, SHORT_DURATION);
    }

    public playMissionSuccessSound(): void {
        const HZ = 820;
        this.playOscillatorSound(HZ, LONG_DURATION);
    }

    public playExplosionSound(duration: number): void {
        const { ctx, master } = this.ensureAudioGraph();

        const bufferSize = ctx.sampleRate * duration;
        const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
        const data = buffer.getChannelData(0);

        for (let i = 0; i < bufferSize; i++) {
            data[i] = Math.random() * 2 - 1;
        }

        const noise = ctx.createBufferSource();
        noise.buffer = buffer;

        const filter = ctx.createBiquadFilter();
        filter.type = "lowpass";
        filter.frequency.setValueAtTime(1000, ctx.currentTime);
        filter.frequency.exponentialRampToValueAtTime(100, ctx.currentTime + duration);

        const gain = ctx.createGain();
        gain.gain.setValueAtTime(1, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + duration);

        noise.connect(filter);
        filter.connect(gain);
        gain.connect(master);

        noise.start();
        noise.stop(ctx.currentTime + duration);
    }

    public playShipDestroyedSound(): void {
        const DURATION = 0.6;
        this.playExplosionSound(DURATION);
    }

    public playOscillatorSound(frequency: number, duration: number, quiet = false): void {
        const { ctx, master } = this.ensureAudioGraph();
        const oscillator = ctx.createOscillator();
        const gain = ctx.createGain();

        gain.gain.value = quiet ? LOW_VOLUME : 1;

        oscillator.connect(gain);
        gain.connect(master);

        oscillator.frequency.setValueAtTime(frequency, ctx.currentTime);
        oscillator.start();
        oscillator.stop(ctx.currentTime + duration);
    }

    private ensureAudioGraph(): { ctx: AudioContext; master: GainNode } {
        if (!this.ctx || !this.master) {
            /* eslint-disable-next-line
                @typescript-eslint/no-unsafe-member-access,
                @typescript-eslint/no-explicit-any */
            this.ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
            this.master = this.ctx.createGain();
            this.master.connect(this.ctx.destination);
            this.master.gain.value = 1;
            this.syncMasterVolume();
        }

        return { ctx: this.ctx, master: this.master };
    }

    private syncMasterVolume(): void {
        if (!this.ctx || !this.master) {
            return;
        }

        const now = this.ctx.currentTime;
        const targetVolume = this.muted ? 0 : this.volume;

        this.master.gain.setValueAtTime(this.master.gain.value, now);
        this.master.gain.linearRampToValueAtTime(targetVolume, now + FADE_TIME_SEC);
    }
}