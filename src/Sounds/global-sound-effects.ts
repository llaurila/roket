import { Store } from "@/Store";
import { SoundEffects } from "./sound-effects";

const VOLUME_KEY = "soundEffectsVol";
const DEFAULT_VOLUME = 1;

const clampVolume = (value: number) => Math.min(1, Math.max(0, value));

function getStoredVolume(): number {
    const storedValue = Store.retrieve(VOLUME_KEY);
    const parsedValue = Number.parseFloat(storedValue ?? "");

    return Number.isFinite(parsedValue)
        ? clampVolume(parsedValue)
        : DEFAULT_VOLUME;
}

class GlobalSoundEffects {
    private _effects: SoundEffects | null = null;

    public get effects(): SoundEffects {
        if (!this._effects) {
            this._effects = new SoundEffects();
            this._effects.setVolume(getStoredVolume());
        }

        return this._effects;
    }

    public async unlock(): Promise<void> {
        await this.effects.resumeContext();
    }

    public getVolume(): number {
        return this.effects.getVolume();
    }

    public setVolume(value: number): void {
        const clampedValue = clampVolume(value);

        this.effects.setVolume(clampedValue);
        Store.persist(VOLUME_KEY, String(clampedValue));
    }

    public restoreVolume(): void {
        this.effects.restoreVolume();
    }

    public mute(): void {
        this.effects.mute();
    }

    public playNotificationSound(): void {
        this.effects.playNotificationSound();
    }

    public playObjectiveClearedSound(): void {
        this.effects.playObjectiveClearedSound();
    }

    public playMissionSuccessSound(): void {
        this.effects.playMissionSuccessSound();
    }

    public playExplosionSound(duration: number): void {
        this.effects.playExplosionSound(duration);
    }

    public playShipDestroyedSound(): void {
        this.effects.playShipDestroyedSound();
    }

    public startLaserBuzzSound(): void {
        this.effects.startLaserBuzzSound();
    }

    public stopLaserBuzzSound(): void {
        this.effects.stopLaserBuzzSound();
    }
}

export const globalSoundEffects = new GlobalSoundEffects();
