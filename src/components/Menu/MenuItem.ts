import type IDrawable from "@/Graphics/IDrawable";
import type { Viewport } from "@/Graphics/Viewport";
import UniqueIdProvider from "@/UniqueIdProvider";
import type { Menu } from ".";
import { Config } from "@/config";
import { getColorString } from "@/Graphics/Color";
import Pointer from "@/Controls/Pointer";
import Rectangle from "@/Graphics/Rectangle";
import Vector from "@/Physics/Vector";

const HEIGHT = 60;
const MARGIN = 4;
const PADDING_LEFT = 20;

export class MenuItem extends EventTarget implements IDrawable {
    public id: number = UniqueIdProvider.next();
    public alive = true;

    public disabled = false;

    private mouseWasDown = false;

    private clickEvent: Event = new Event("click");

    public constructor(public text: string, public parent: Menu) {
        super();
    }

    public getWidth = () => this.parent.width;

    public getHeight = () => HEIGHT;

    public update(viewport: Viewport) {
        const mouseIsDown = Pointer.leftPressed();
        const mouseOver = this.isMouseOver(viewport);

        if (mouseOver) {
            const mouseDown = Pointer.leftPressed();
            if (mouseDown && !this.mouseWasDown) {
                this.dispatchEvent(this.clickEvent);
            }
        }

        this.mouseWasDown = mouseIsDown;
    }

    public draw(viewport: Viewport) {
        const { ctx } = viewport;

        ctx.fillStyle = this.getFontColor(viewport);
        ctx.font = `20px ${Config.typography.fontFamily}`;
        ctx.textAlign = "left";
        ctx.textBaseline = "middle";

        ctx.fillText(this.text, PADDING_LEFT, HEIGHT / 2);

        ctx.fillStyle = "rgba(0, 0, 0, 0.2)";
        ctx.fillRect(MARGIN, MARGIN, this.getWidth() - MARGIN * 2, HEIGHT - MARGIN * 2);
    }

    private getContentRect(viewport: Viewport): Rectangle {
        const parentRect = this.parent.getContentRect(viewport);
        return new Rectangle(
            parentRect.topLeft.add(new Vector(0, this.parent.items.indexOf(this) * HEIGHT)),
            new Vector(this.getWidth(), HEIGHT)
        );
    }

    private isMouseOver(viewport: Viewport): boolean {
        const mouse = Pointer.getPosition();
        const contentRect = this.getContentRect(viewport);
        return contentRect.contains(mouse);
    }

    private getFontColor(viewport: Viewport) {
        let color = "white";

        if (this.disabled) {
            color = "rgba(255, 255, 255, .25)";
        }
        else if (this.isMouseOver(viewport)) {
            color = getColorString(Config.typography.emphasisColor);
        }

        return color;
    }
}
