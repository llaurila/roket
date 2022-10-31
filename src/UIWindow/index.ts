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

export enum WindowPosition {
    Absolute,
    Center
}

export class UIWindow implements IDrawable, IUpdatable {
    public id: number = UniqueIdProvider.next();
    alive = true;

    width: number;
    height: number;

    title = "ROKET";
    error = false;

    fadeOut = false;
    opacity = 1;

    position = WindowPosition.Center;
    absolutePosition = Vector.Zero;
    relativePosition = Vector.Zero;

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

    private getHeight(ctx: CanvasRenderingContext2D): number {
        return Math.min(this.height, ctx.canvas.height - Config.ui.window.margin * 2);
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

    private getTitleRect(ctx: CanvasRenderingContext2D): Rectangle {
        let topLeft: Vector;
        const size = new Vector(this.width, config.titleHeight);

        if (this.position == WindowPosition.Absolute) {
            topLeft = this.absolutePosition.add(this.relativePosition);
        }
        else {
            const center = getCenter(ctx);
            topLeft = (
                new Vector(center.x - this.width / 2, center.y - this.getHeight(ctx) / 2)
            ).add(this.relativePosition);
        }

        return new Rectangle(topLeft, size);
    }

    protected getContentRect(ctx: CanvasRenderingContext2D): Rectangle {
        const titleRect = this.getTitleRect(ctx);
        const titleSpace = titleRect.size.y + config.margin;

        return new Rectangle(
            titleRect.topLeft.add(Vector.UnitY.mul(titleSpace)),
            new Vector(this.width, this.getHeight(ctx) - titleSpace)
        );
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
