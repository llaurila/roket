import { UIWindow } from ".";
import { Config } from "@/config";
import { getColorString } from "@/Graphics/Color";
import Rectangle from "@/Graphics/Rectangle";
import type { Viewport } from "@/Graphics/Viewport";
import { getTextLines } from "@/Typography";
import AlertActions from "./AlertActions";

const config = Config.ui.alert;

export default class Alert extends UIWindow {
    public content = "";
    public actions = new AlertActions();

    private contentRect: Rectangle = Rectangle.Zero;
    private lines: string[] = [];

    public constructor() {
        super(config.windowWidth, 0);
    }

    public draw(viewport: Viewport) {
        const { ctx } = viewport;

        ctx.save();
        ctx.resetTransform();

        this.width = Math.min(config.windowWidth, viewport.width - Config.ui.window.margin * 2);
        this.updateContent(viewport);
        this.height = this.getWindowHeight();
        this.contentRect = this.getContentRect(viewport);

        super.draw(viewport);

        ctx.globalAlpha = this.opacity;
        this.drawText(viewport);
        this.actions.update(this.contentRect);
        this.actions.draw(viewport, this.contentRect);

        ctx.restore();
    }

    private updateContent(viewport: Viewport): void {
        const { ctx } = viewport;

        ctx.font = `${config.fontSize}px ${Config.typography.fontFamily}`;
        ctx.textBaseline = "top";
        ctx.fillStyle = getColorString(config.fontColor);

        this.contentRect = this.getContentRect(viewport);

        this.lines = getTextLines(
            ctx,
            this.content,
            this.contentRect.size.x - config.padding * 2
        );
    }

    private getWindowHeight(): number {
        return config.lineHeight * this.lines.length +
            config.padding * 2 +
            this.actions.height +
            Config.ui.window.titleHeight +
            Config.ui.window.margin;
    }

    private drawText(viewport: Viewport): void {
        const { ctx } = viewport;
        const { lines } = this;

        for (let lineIndex = 0; lineIndex < lines.length; lineIndex++) {
            ctx.fillText(
                lines[lineIndex],
                this.contentRect.topLeft.x + config.padding,
                this.contentRect.topLeft.y + config.padding + config.lineHeight * lineIndex
            );
        }
    }
}
