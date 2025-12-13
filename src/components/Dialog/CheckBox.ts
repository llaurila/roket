import type { Viewport } from "@/Graphics/Viewport";
import type UIDialog from ".";
import UIInputBase from "./InputBase";
import type Rectangle from "@/Graphics/Rectangle";
import { makeBgGradient } from "../UIWindow/utils";
import { getColorString } from "@/Graphics/Color";
import { Config } from "@/config";
import Pointer from "@/Controls/Pointer";

const SIZE = 30;
const CHECK_RECT_SIZE = 12;
const MARGIN = 12;

export default class UICheckBox extends UIInputBase {
    private mouseWasDown = false;

    public constructor(
        dialog: UIDialog,
        public label: string,
        public checked = false
    ) {
        super(dialog);
    }

    public height(): number { return SIZE; }

    public draw(viewport: Viewport): void {
        const { ctx } = viewport;
        const rect = this.getRect(viewport);
        this.drawBox(ctx, rect);
        this.drawLabel(ctx, rect);
    }

    public update(viewport: Viewport): void {
        const mouseIsDown = Pointer.leftPressed();
        const mouseOver = this.isMouseOver(viewport);

        if (mouseOver && !this.mouseWasDown && mouseIsDown) {
            this.checked = !this.checked;
            this.triggerChange();
        }

        this.mouseWasDown = mouseIsDown;
    }

    private drawBox(ctx: CanvasRenderingContext2D, rect: Rectangle) {
        const boxRect = this.getBoxRect(rect);

        ctx.save();
        ctx.fillStyle = makeBgGradient(ctx, boxRect);
        boxRect.fill(ctx);

        ctx.strokeStyle = getColorString(Config.ui.window.borderColor);
        ctx.lineWidth = Config.ui.window.borderWidth;
        boxRect.stroke(ctx);

        if (this.checked) {
            const checkedRect = boxRect.clone();

            const offset = (boxRect.size.x - CHECK_RECT_SIZE) / 2;

            checkedRect.size.x = CHECK_RECT_SIZE;
            checkedRect.size.y = CHECK_RECT_SIZE;
            checkedRect.topLeft.x += offset;
            checkedRect.topLeft.y += offset;

            ctx.fillStyle = getColorString(Config.typography.inputColor);
            checkedRect.fill(ctx);
        }

        ctx.restore();
    }

    private drawLabel(ctx: CanvasRenderingContext2D, rect: Rectangle) {
        const labelX = rect.topLeft.x + SIZE + MARGIN;
        const labelY = rect.topLeft.y + (rect.size.y / 2);
        ctx.fillStyle = getColorString(Config.typography.defaultColor);
        ctx.textBaseline = "middle";
        ctx.font = `${Config.typography.messageFontSize}px ${Config.typography.fontFamily}`;
        ctx.fillText(this.label, labelX, labelY);
    }

    private getBoxRect(rect: Rectangle): Rectangle {
        const boxRect = rect.clone();
        boxRect.size.x = SIZE;
        return boxRect;
    }

    private triggerChange() {
        this.dispatchEvent(
            new CustomEvent(
                "change",
                { detail: { checked: this.checked } }
            )
        );
    }
}
