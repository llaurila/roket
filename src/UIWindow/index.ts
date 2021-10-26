import { Config } from "../config";
import Camera from "../Graphics/Camera";
import { getColorString } from "../Graphics/Color";
import IDrawable from "../Graphics/IDrawable";
import Rectangle from "../Graphics/Rectangle";
import IUpdatable from "../Physics/IUpdatable";
import Vector from "../Physics/Vector";
import UniqueIdProvider from "../UniqueIdProvider";
import { getCenter } from "../Utils";

const config = Config.ui.window;

export class UIWindow implements IDrawable, IUpdatable {
    public id: number = UniqueIdProvider.next();
    alive = true;

    width: number;
    height: number;

    title = "Roket";
    error = false;

    fadeOut = false;
    opacity = 1;

    constructor(width: number, height: number) {
        this.width = width;
        this.height = height;
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    draw(ctx: CanvasRenderingContext2D, camera: Camera) {
        ctx.save();
        ctx.resetTransform();

        ctx.globalAlpha = this.opacity;

        this.drawTitle(ctx);
        this.drawContent(ctx);

        ctx.restore();
    }

    private drawTitle(ctx: CanvasRenderingContext2D) {
        const titleRect = this.getTitleRect(ctx);
        ctx.fillStyle = getColorString(
            this.error ? config.titleBackgroundColorError : config.titleBackgroundColor);
        titleRect.fill(ctx);

        ctx.font = `bold ${config.titleFontSize}px ${Config.typography.fontFamily}`;
        ctx.textBaseline = "middle";
        ctx.fillStyle = getColorString(
            this.error ? Config.typography.errorColor : config.titleFontColor
        );

        ctx.fillText(
            this.title,
            titleRect.topLeft.x + config.titlePadding,
            titleRect.topLeft.y + titleRect.size.y / 2
        );
    }

    private drawContent(ctx: CanvasRenderingContext2D) {
        const contentRect = this.getContentRect(ctx);

        ctx.fillStyle = makeBgGradient(ctx, contentRect);
        contentRect.fill(ctx);

        ctx.strokeStyle = getColorString(config.borderColor);
        ctx.lineWidth = config.borderWidth;
        contentRect.stroke(ctx);
    }

    private getTitleRect(ctx: CanvasRenderingContext2D) {
        const rect = this.getContentRect(ctx);

        rect.topLeft.x -= config.borderWidth;
        rect.topLeft.y -= config.titleHeight + config.titleMargin + config.borderWidth;

        rect.size.x += config.borderWidth * 2;
        rect.size.y = config.titleHeight + config.borderWidth * 2;

        return rect;
    }

    protected getContentRect(ctx: CanvasRenderingContext2D) {
        const center = getCenter(ctx);
        const size = new Vector(this.width, this.height);
        const topLeft = center.sub(size.div(2));
        return new Rectangle(topLeft, size);
    }

    update(time: number, delta: number) {
        if (this.fadeOut) {
            this.opacity = Math.max(0, this.opacity - delta / config.fadeOutDuration);
            if (this.opacity == 0) {
                this.alive = false;
            }
        }
    }
}

function makeBgGradient(ctx: CanvasRenderingContext2D, rect: Rectangle) {
    const grd = ctx.createLinearGradient(0, rect.topLeft.y, 0, rect.topLeft.y + rect.size.y);
    grd.addColorStop(0, getColorString(config.backgroundColorTop));
    grd.addColorStop(1, getColorString(config.backgroundColorBottom));
    return grd;
}
