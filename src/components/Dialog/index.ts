import { UIWindow } from "../UIWindow";
import type { Viewport } from "@/Graphics/Viewport";
import UIButton from "./Button";
import UITextInput from "./TextInput";

export default class UIDialog extends UIWindow {
    public buttons: UIButton[] = [];
    public textInputs: UITextInput[] = [];

    public constructor(width: number, height: number) {
        super(width, height);
    }

    public addButton(caption: string): UIButton {
        const btn = new UIButton(caption, this);
        this.buttons.push(btn);
        return btn;
    }

    public addTextInput(value = ""): UITextInput {
        const input = new UITextInput(this, value);
        this.textInputs.push(input);
        return input;
    }

    public update(time: number, delta: number) {
        super.update(time, delta);
    }

    public draw(viewport: Viewport) {
        if (!this.visible) return;

        const { ctx } = viewport;

        ctx.save();
        ctx.resetTransform();

        super.draw(viewport);

        ctx.globalAlpha = this.opacity;
        for (const input of this.textInputs) {
            input.update(viewport);
            input.draw(viewport);
        }
        for (const btn of this.buttons) {
            btn.update(viewport);
            btn.draw(viewport);
        }

        ctx.restore();
    }
}

export { UIButton, UITextInput };
