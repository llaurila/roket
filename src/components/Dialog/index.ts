import { UIWindow } from "../UIWindow";
import type { Viewport } from "@/Graphics/Viewport";
import UIButton from "./Button";
import UITextInput from "./TextInput";
import type UIInputBase from "./InputBase";
import UICheckBox from "./CheckBox";

export default class UIDialog extends UIWindow {
    public buttons: UIButton[] = [];
    public inputs: UIInputBase[] = [];

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
        this.inputs.push(input);
        return input;
    }

    public addCheckBox(checked = false): UICheckBox {
        const input = new UICheckBox(this, checked);
        this.inputs.push(input);
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
        for (const input of this.inputs) {
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
