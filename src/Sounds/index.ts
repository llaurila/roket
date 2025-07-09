/* eslint-disable no-magic-numbers */

const LOW_VOLUME = 0.33;
const SHORT_DURATION = 0.05;
const LONG_DURATION = 0.4;

const audioCtx = new AudioContext();

const halfVolume = audioCtx.createGain();
halfVolume.gain.value = LOW_VOLUME;
halfVolume.connect(audioCtx.destination);

export const playOscillatorSound = (frequency: number, duration: number, quiet = false) => {
    const oscillator = audioCtx.createOscillator();

    if (quiet) {
        oscillator.connect(halfVolume);
    }
    else {
        oscillator.connect(audioCtx.destination);
    }

    oscillator.frequency.setValueAtTime(frequency, audioCtx.currentTime);
    oscillator.start();
    oscillator.stop(audioCtx.currentTime + duration);
};

export const playNotificationSound = () => {
    const HZ = 400;
    playOscillatorSound(HZ, SHORT_DURATION, true);
};

export const playObjectiveClearedSound = () => {
    const HZ = 820;
    playOscillatorSound(HZ, SHORT_DURATION);
};

export const playMissionSuccessSound = () => {
    const HZ = 820;
    playOscillatorSound(HZ, LONG_DURATION);
};

export const playExplosionSound = (duration: number) => {
    const bufferSize = audioCtx.sampleRate * duration;
    const buffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate);
    const data = buffer.getChannelData(0);

    for (let i = 0; i < bufferSize; i++) {
        data[i] = Math.random() * 2 - 1;
    }

    const noise = audioCtx.createBufferSource();
    noise.buffer = buffer;

    const filter = audioCtx.createBiquadFilter();
    filter.type = "lowpass";
    filter.frequency.setValueAtTime(1000, audioCtx.currentTime);
    filter.frequency.exponentialRampToValueAtTime(100, audioCtx.currentTime + duration);

    const gain = audioCtx.createGain();
    gain.gain.setValueAtTime(1, audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + duration);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(audioCtx.destination);

    noise.start();
    noise.stop(audioCtx.currentTime + duration);
};

export const playShipDestroyedSound = () => {
    const DURATION = .6;
    playExplosionSound(DURATION);
};
