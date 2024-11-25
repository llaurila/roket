const LOW_VOLUME = 0.33;
const SHORT_DURATION = 0.05;
const LONG_DURATION = 0.4;

const audioCtx = new AudioContext();

const halfVolume = audioCtx.createGain();
halfVolume.gain.value = LOW_VOLUME;
halfVolume.connect(audioCtx.destination);

export const playSound = (frequency: number, duration: number, quiet = false) => {
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
    playSound(HZ, SHORT_DURATION, true);
};

export const playObjectiveClearedSound = () => {
    const HZ = 820;
    playSound(HZ, SHORT_DURATION);
};

export const playMissionSuccessSound = () => {
    const HZ = 820;
    playSound(HZ, LONG_DURATION);
};
