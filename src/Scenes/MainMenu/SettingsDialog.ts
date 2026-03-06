import UIDialog from "@/components/Dialog";
import type UICheckBox from "@/components/Dialog/CheckBox";
import { globalJukebox } from "@/Sounds/global-jukebox";
import { globalSoundEffects } from "@/Sounds/global-sound-effects";
import { Store } from "@/Store";

const WIDTH = 400;
const HEIGHT = 190;

const PLAY_MUSIC_KEY = "playMusic";
const PLAY_SOUND_EFFECTS_KEY = "playSoundEffects";

type CheckedChangeEvent = CustomEvent<{ checked: boolean }>;

export class SettingsDialog {
    public uiDialog = new UIDialog(WIDTH, HEIGHT);
    public playMusicCheckbox: UICheckBox;
    public playSoundEffectsCheckbox: UICheckBox;

    public closeHandler?: () => void;

    public constructor() {
        this.uiDialog.title = "SETTINGS";
        this.uiDialog.visible = false;

        this.playMusicCheckbox = this.createPlayMusicCheckbox();
        this.playSoundEffectsCheckbox = this.createPlaySoundEffectsCheckbox();

        this.uiDialog.addButton("CLOSE").addEventListener("click", this.triggerClose.bind(this));
    }

    private createPlayMusicCheckbox(): UICheckBox {
        const cb = this.uiDialog.addCheckBox(
            "PLAY MUSIC",
            Store.retrieve(PLAY_MUSIC_KEY) !== "false"
        );

        cb.addEventListener("change", (e) => {
            const checked = (e as CheckedChangeEvent).detail.checked;
            Store.persist(PLAY_MUSIC_KEY, checked ? "true" : "false");

            if (checked) globalJukebox.restoreVolume();
            else globalJukebox.mute();
        });

        return cb;
    }

    private createPlaySoundEffectsCheckbox(): UICheckBox {
        const cb = this.uiDialog.addCheckBox(
            "PLAY SOUND FX",
            Store.retrieve(PLAY_SOUND_EFFECTS_KEY) !== "false"
        );

        cb.addEventListener("change", (e) => {
            const checked = (e as CheckedChangeEvent).detail.checked;
            Store.persist(PLAY_SOUND_EFFECTS_KEY, checked ? "true" : "false");

            if (checked) globalSoundEffects.restoreVolume();
            else globalSoundEffects.mute();
        });

        return cb;
    }

    private triggerClose() {
        this.uiDialog.hide();
        this.closeHandler?.();
    };
}
