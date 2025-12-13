import type { UITextInput } from "@/components/Dialog";
import UIDialog from "@/components/Dialog";
import type { Player } from "@/Player";

const WIDTH = 400;
const HEIGHT = 150;

export class PlayerNameDialog {
    public uiDialog = new UIDialog(WIDTH, HEIGHT);
    public nameInput: UITextInput;

    public setNameHandler?: (name: string) => void;
    public closeHandler?: () => void;

    private player: Player;

    public constructor(player: Player) {
        this.player = player;

        this.uiDialog.title = "ENTER PLAYER NAME";
        this.uiDialog.visible = false;

        this.nameInput = this.createNameInput();

        this.uiDialog.addButton("OK").addEventListener("click", this.triggerSetName.bind(this));
        this.uiDialog.addButton("CANCEL").addEventListener("click", this.triggerClose.bind(this));
    }

    private createNameInput() {
        const nameInput = this.uiDialog.addTextInput(this.player.name);
        nameInput.maxLength = 8;

        nameInput.addEventListener("enter", this.triggerSetName.bind(this));
        nameInput.addEventListener("escape", this.triggerClose.bind(this));

        return nameInput;
    }

    private triggerSetName() {
        try {
            this.setNameHandler?.(this.nameInput.value);
            this.triggerClose();
        }
        catch {
            this.uiDialog.error = true;
            this.uiDialog.title = "INVALID NAME";
        }
    };

    private triggerClose() {
        this.uiDialog.hide();
        this.closeHandler?.();
    };
}
