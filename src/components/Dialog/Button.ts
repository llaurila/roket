import type IDrawable from "@/Graphics/IDrawable";
import UniqueIdProvider from "@/UniqueIdProvider";
import Pointer from "@/Controls/Pointer";
import { getColorString } from "@/Graphics/Color";
import type { Viewport } from "@/Graphics/Viewport";
import { Config } from "@/config";
import Rectangle from "@/Graphics/Rectangle";
import Vector from "@/Physics/Vector";
import { makeBgGradient } from "../UIWindow/utils";
import type UIDialog from "./index";

const HEIGHT = 30;
const MARGIN = 8;
const PADDING_X = 10;
const FONT_SIZE = Config.typography.messageFontSize;

export default class UIButton extends EventTarget implements IDrawable {
    public id: number = UniqueIdProvider.next();
    public alive = true;

    private mouseWasDown = false;
    private clickEvent: Event = new Event("click");

    public constructor(public text: string, private dialog: UIDialog) {
        super();
    }

    public draw(viewport: Viewport) {
        const { ctx } = viewport;
        const rect = this.getRect(viewport);

        ctx.save();

        ctx.fillStyle = makeBgGradient(ctx, rect);
        rect.fill(ctx);

        ctx.strokeStyle = getColorString(Config.ui.window.borderColor);
        ctx.lineWidth = Config.ui.window.borderWidth;
        rect.stroke(ctx);

        ctx.font = `${FONT_SIZE}px ${Config.typography.fontFamily}`;
        ctx.textBaseline = "middle";
        ctx.textAlign = "center";
        ctx.fillStyle = getColorString(Config.typography.defaultColor);
        ctx.fillText(
            this.text,
            rect.topLeft.x + rect.size.x / 2,
            rect.topLeft.y + rect.size.y / 2
        );

        ctx.restore();

        this.update(viewport);
    }

    public update(viewport: Viewport) {
        const mouseIsDown = Pointer.leftPressed();
        const mouseOver = this.isMouseOver(viewport);

        if (mouseOver && mouseIsDown && !this.mouseWasDown) {
            this.dispatchEvent(this.clickEvent);
        }

        this.mouseWasDown = mouseIsDown;
    }

    public getHeight(): number {
        return HEIGHT;
    }

    public getWidth(ctx: CanvasRenderingContext2D): number {
        ctx.font = `${FONT_SIZE}px ${Config.typography.fontFamily}`;
        return ctx.measureText(this.text).width + PADDING_X * 2;
    }

    private getRect(viewport: Viewport): Rectangle {
        const { ctx } = viewport;
        const width = this.getWidth(ctx);
        const height = HEIGHT;
        const parentRect = this.dialog.getContentRect(viewport);

        let offsetX = MARGIN;
        const index = this.dialog.buttons.indexOf(this);
        for (let i = this.dialog.buttons.length - 1; i > index; i--) {
            offsetX += this.dialog.buttons[i].getWidth(ctx) + MARGIN;
        }

        const pos = new Vector(
            parentRect.bottomRight.x - offsetX - width,
            parentRect.bottomRight.y - height - MARGIN
        );

        return new Rectangle(pos, new Vector(width, height));
    }

    private isMouseOver(viewport: Viewport): boolean {
        if (!this.dialog.visible) return false;
        const mouse = Pointer.getPosition();
        const rect = this.getRect(viewport);
        return rect.contains(mouse);
    }
}
