import { UIWindow } from "../UIWindow";
import type { Viewport } from "@/Graphics/Viewport";
import UIButton from "./Button";
import UITextInput from "./TextInput";
import type UIInputBase from "./InputBase";
import UICheckBox from "./CheckBox";
import Pointer from "@/Controls/Pointer";
import { Config } from "@/config";

export default class UIDialog extends UIWindow {
    public buttons: UIButton[] = [];
    public inputs: UIInputBase[] = [];
    private ignoredPressId = 0;
    private readonly preferredWidth: number;

    public constructor(width: number, height: number) {
        super(width, height);
        this.preferredWidth = width;
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

    public addCheckBox(label: string, checked = false): UICheckBox {
        const input = new UICheckBox(this, label,checked);
        this.inputs.push(input);
        return input;
    }

    public override show() {
        super.show();
        this.ignoredPressId = Pointer.getPressId();
    }

    public override hide() {
        super.hide();
        for (const input of this.inputs) input.hide();
    }

    public shouldIgnorePointerInput(): boolean {
        return Pointer.getPressId() === 0 || Pointer.getPressId() === this.ignoredPressId;
    }

    public update(time: number, delta: number) {
        super.update(time, delta);
    }

    public draw(viewport: Viewport) {
        if (!this.visible) return;

        this.width = Math.min(this.preferredWidth, viewport.width - Config.ui.window.margin * 2);

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
