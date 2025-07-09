import { UIWindow } from "../UIWindow";
import type { Viewport } from "@/Graphics/Viewport";
import UIButton from "./Button";

export default class UIDialog extends UIWindow {
    public buttons: UIButton[] = [];

    public constructor(width: number, height: number) {
        super(width, height);
    }

    public addButton(caption: string): UIButton {
        const btn = new UIButton(caption, this);
        this.buttons.push(btn);
        return btn;
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
        for (const btn of this.buttons) {
            btn.update(viewport);
            btn.draw(viewport);
        }

        ctx.restore();
    }
}

export { UIButton };
