/* eslint-disable no-magic-numbers */

import { Config } from "@/config";

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
    private laserBuzzOscillator: OscillatorNode | null = null;
    private laserBuzzNoise: AudioBufferSourceNode | null = null;
    private laserBuzzGain: GainNode | null = null;

    public async resumeContext(): Promise<void> {
        const graph = this.ensureAudioGraph();

        if (!graph) {
            return;
        }

        const { ctx } = graph;

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
        const graph = this.ensureAudioGraph();

        if (!graph) {
            return;
        }

        const { ctx, master } = graph;

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

    public startLaserBuzzSound(): void {
        if (this.laserBuzzGain) {
            return;
        }

        const graph = this.ensureAudioGraph();

        if (!graph) {
            return;
        }

        const { ctx, master } = graph;
        const now = ctx.currentTime;

        const buzzGain = ctx.createGain();
        buzzGain.gain.setValueAtTime(0, now);
        buzzGain.gain.linearRampToValueAtTime(Config.laser.soundVolume, now + 0.03);

        const reverb = ctx.createConvolver();
        reverb.buffer = this.createReverbImpulse(ctx, 0.28, 1.5);

        const dryGain = ctx.createGain();
        dryGain.gain.value = 0.78;

        const wetGain = ctx.createGain();
        wetGain.gain.value = 0.22;

        const oscillator = ctx.createOscillator();
        oscillator.type = "sawtooth";
        oscillator.frequency.setValueAtTime(120, now);

        const oscillatorGain = ctx.createGain();
        oscillatorGain.gain.value = 0.65;

        const noiseBuffer = ctx.createBuffer(1, Math.floor(ctx.sampleRate * 0.2), ctx.sampleRate);
        const data = noiseBuffer.getChannelData(0);

        for (let i = 0; i < data.length; i++) {
            data[i] = Math.random() * 2 - 1;
        }

        const noise = ctx.createBufferSource();
        noise.buffer = noiseBuffer;
        noise.loop = true;

        const noiseFilter = ctx.createBiquadFilter();
        noiseFilter.type = "bandpass";
        noiseFilter.frequency.setValueAtTime(1600, now);
        noiseFilter.Q.setValueAtTime(2, now);

        const noiseGain = ctx.createGain();
        noiseGain.gain.value = 0.35;

        oscillator.connect(oscillatorGain);
        oscillatorGain.connect(buzzGain);

        noise.connect(noiseFilter);
        noiseFilter.connect(noiseGain);
        noiseGain.connect(buzzGain);

        buzzGain.connect(dryGain);
        buzzGain.connect(reverb);
        reverb.connect(wetGain);

        dryGain.connect(master);
        wetGain.connect(master);

        oscillator.start(now);
        noise.start(now);

        this.laserBuzzOscillator = oscillator;
        this.laserBuzzNoise = noise;
        this.laserBuzzGain = buzzGain;
    }

    public stopLaserBuzzSound(): void {
        if (!this.laserBuzzGain) {
            return;
        }

        this.fadeOutLaserBuzz();

        this.clearLaserBuzzState();
    }

    public playOscillatorSound(frequency: number, duration: number, quiet = false): void {
        const graph = this.ensureAudioGraph();

        if (!graph) {
            return;
        }

        const { ctx, master } = graph;
        const oscillator = ctx.createOscillator();
        const gain = ctx.createGain();

        gain.gain.value = quiet ? LOW_VOLUME : 1;

        oscillator.connect(gain);
        gain.connect(master);

        oscillator.frequency.setValueAtTime(frequency, ctx.currentTime);
        oscillator.start();
        oscillator.stop(ctx.currentTime + duration);
    }

    private ensureAudioGraph(): { ctx: AudioContext; master: GainNode } | null {
        const AudioContextImpl = this.getAudioContextImpl();
        if (!AudioContextImpl) {
            return null;
        }

        this.initializeAudioGraph(AudioContextImpl);

        if (!this.ctx || !this.master) {
            return null;
        }

        return { ctx: this.ctx, master: this.master };
    }

    private clearLaserBuzzState(): void {
        this.laserBuzzOscillator = null;
        this.laserBuzzNoise = null;
        this.laserBuzzGain = null;
    }

    private fadeOutLaserBuzz(): void {
        const graph = this.ensureAudioGraph();
        if (!graph) {
            return;
        }

        const gain = this.laserBuzzGain;
        if (!gain) {
            return;
        }

        const now = graph.ctx.currentTime;

        gain.gain.cancelScheduledValues(now);
        gain.gain.setValueAtTime(gain.gain.value, now);
        gain.gain.linearRampToValueAtTime(0, now + 0.06);

        this.stopScheduledNode(this.laserBuzzOscillator, now + 0.07);
        this.stopScheduledNode(this.laserBuzzNoise, now + 0.07);
    }

    private stopScheduledNode(node: AudioScheduledSourceNode | null, stopAt: number): void {
        if (!node) {
            return;
        }

        node.stop(stopAt);
    }

    private getAudioContextImpl(): (new () => AudioContext) | null {
        if (typeof window === "undefined") {
            return null;
        }

        /* eslint-disable-next-line
            @typescript-eslint/no-unsafe-member-access,
            @typescript-eslint/no-explicit-any */
        const AudioContextImpl = window.AudioContext || (window as any).webkitAudioContext;

        return AudioContextImpl as (new () => AudioContext) | null;
    }

    private initializeAudioGraph(AudioContextImpl: new () => AudioContext): void {
        if (this.ctx && this.master) {
            return;
        }

        this.ctx = new AudioContextImpl();
        this.master = this.ctx.createGain();
        this.master.connect(this.ctx.destination);
        this.master.gain.value = 1;
        this.syncMasterVolume();
    }

    private createReverbImpulse(ctx: AudioContext, duration: number, decay: number): AudioBuffer {
        const length = Math.floor(ctx.sampleRate * duration);
        const impulse = ctx.createBuffer(2, length, ctx.sampleRate);

        for (let channel = 0; channel < impulse.numberOfChannels; channel++) {
            const channelData = impulse.getChannelData(channel);

            for (let i = 0; i < length; i++) {
                const progress = i / Math.max(1, length - 1);
                const envelope = Math.pow(1 - progress, decay);
                channelData[i] = (Math.random() * 2 - 1) * envelope;
            }
        }

        return impulse;
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
