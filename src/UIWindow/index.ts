import { Config } from "../config";
import type Camera from "../Graphics/Camera";
import { getColorString } from "../Graphics/Color";
import type IDrawable from "../Graphics/IDrawable";
import Rectangle from "../Graphics/Rectangle";
import type IUpdatable from "../Physics/IUpdatable";
import Vector from "../Physics/Vector";
import UniqueIdProvider from "../UniqueIdProvider";
import { getCenter } from "../Utils";
import { makeBgGradient } from "./utils";

const config = Config.ui.window;

export enum WindowPosition {
    Absolute,
    Center
}

export class UIWindow implements IDrawable, IUpdatable {
    public id: number = UniqueIdProvider.next();
    public alive = true;

    public width: number;
    public height: number;

    public title = "ROKET";
    public error = false;

    public fadeOut = false;
    public opacity = 1;

    public position = WindowPosition.Center;
    public absolutePosition = Vector.Zero;
    public relativePosition = Vector.Zero;

    public constructor(width: number, height: number) {
        this.width = width;
        this.height = height;
    }

    public update(_time: number, delta: number) {
        if (this.fadeOut) {
            this.opacity = Math.max(0, this.opacity - delta / config.fadeOutDuration);
            if (this.opacity == 0) {
                this.alive = false;
            }
        }
    }

    public draw(ctx: CanvasRenderingContext2D, _camera: Camera) {
        ctx.save();
        ctx.resetTransform();

        ctx.globalAlpha = this.opacity;

        this.drawTitle(ctx);
        this.drawContent(ctx);

        ctx.restore();
    }

    protected getContentRect(ctx: CanvasRenderingContext2D): Rectangle {
        const titleRect = this.getTitleRect(ctx);
        const titleSpace = titleRect.size.y + config.margin;

        return new Rectangle(
            titleRect.topLeft.add(Vector.UnitY.mul(titleSpace)),
            new Vector(this.width, this.getHeight(ctx) - titleSpace)
        );
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
}
