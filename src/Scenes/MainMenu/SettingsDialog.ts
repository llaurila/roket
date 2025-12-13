import UIDialog from "@/components/Dialog";
import type UICheckBox from "@/components/Dialog/CheckBox";
import { globalJukebox } from "@/Sounds/global-jukebox";
import { Store } from "@/Store";

const WIDTH = 400;
const HEIGHT = 150;

const PLAY_MUSIC_KEY = "playMusic";

type CheckedChangeEvent = CustomEvent<{ checked: boolean }>;

export class SettingsDialog {
    public uiDialog = new UIDialog(WIDTH, HEIGHT);
    public playMusicCheckbox: UICheckBox;

    public closeHandler?: () => void;

    public constructor() {
        this.uiDialog.title = "SETTINGS";
        this.uiDialog.visible = false;

        this.playMusicCheckbox = this.createPlayMusicCheckbox();

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

    private triggerClose() {
        this.uiDialog.hide();
        this.closeHandler?.();
    };
}
