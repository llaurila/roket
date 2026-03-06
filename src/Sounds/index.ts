import { globalSoundEffects } from "./global-sound-effects";

export const playNotificationSound = () => {
    globalSoundEffects.playNotificationSound();
};

export const playObjectiveClearedSound = () => {
    globalSoundEffects.playObjectiveClearedSound();
};

export const playMissionSuccessSound = () => {
    globalSoundEffects.playMissionSuccessSound();
};

export const playExplosionSound = (duration: number) => {
    globalSoundEffects.playExplosionSound(duration);
};

export const playShipDestroyedSound = () => {
    globalSoundEffects.playShipDestroyedSound();
};
