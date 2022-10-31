import { UIWindow } from ".";
import { Config } from "../config";
import Camera from "../Graphics/Camera";
import { getColorString } from "../Graphics/Color";
import Rectangle from "../Graphics/Rectangle";
import { getTextLines } from "../Typography";

const config = Config.ui.alert;

export default class Alert extends UIWindow {
    content = "";

    private contentRect: Rectangle = Rectangle.Zero;
    private lines: string[] = [];

    constructor() {
        super(config.windowWidth, 0);
    }

    draw(ctx: CanvasRenderingContext2D, camera: Camera) {
        ctx.save();
        ctx.resetTransform();

        this.updateContent(ctx);
        this.height = this.getWindowHeight();

        super.draw(ctx, camera);

        ctx.globalAlpha = this.opacity;
        this.drawText(ctx);

        ctx.restore();
    }

    private updateContent(ctx: CanvasRenderingContext2D): void {
        ctx.font = `${config.fontSize}px ${Config.typography.fontFamily}`;
        ctx.textBaseline = "top";
        ctx.fillStyle = getColorString(config.fontColor);

        this.contentRect = this.getContentRect(ctx);

        this.lines = getTextLines(
            ctx,
            this.content,
            this.contentRect.size.x - config.padding * 2
        );
    }

    private getWindowHeight(): number {
        return config.lineHeight * this.lines.length +
            config.padding * 2 +
            Config.ui.window.titleHeight +
            Config.ui.window.margin;
    }

    private drawText(ctx: CanvasRenderingContext2D): void {
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
