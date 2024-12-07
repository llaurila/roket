import { Config } from "@/config";
import { getColorString } from "@/Graphics/Color";
import type IDrawable from "@/Graphics/IDrawable";
import Rectangle from "@/Graphics/Rectangle";
import type IUpdatable from "@/Physics/IUpdatable";
import Vector from "@/Physics/Vector";
import UniqueIdProvider from "@/UniqueIdProvider";
import { makeBgGradient } from "./utils";
import type { Viewport } from "@/Graphics/Viewport";

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

    public opacity = 1;

    public position = WindowPosition.Center;
    public absolutePosition = Vector.Zero;
    public relativePosition = Vector.Zero;

    private fadeOutCallback: (() => void)|undefined;

    public constructor(width: number, height: number) {
        this.width = width;
        this.height = height;
    }

    public update(_time: number, delta: number) {
        if (this.fadeOutCallback) {
            this.opacity = Math.max(0, this.opacity - delta / config.fadeOutDuration);
            if (this.opacity == 0) {
                this.alive = false;
                this.fadeOutCallback();
            }
        }
    }

    public draw(viewport: Viewport) {
        const { ctx } = viewport;

        ctx.save();
        ctx.resetTransform();

        ctx.globalAlpha = this.opacity;

        this.drawTitle(viewport);
        this.drawContent(viewport);

        ctx.restore();
    }

    public setContentHeight(height: number) {
        this.height = config.titleHeight + height + config.margin;
    }

    public fadeOut(callback?: () => void) {
        this.fadeOutCallback = callback;
    }

    public getContentRect(viewport: Viewport): Rectangle {
        const titleRect = this.getTitleRect(viewport);
        const titleSpace = titleRect.size.y + config.margin;

        return new Rectangle(
            titleRect.topLeft.add(Vector.UnitY.mul(titleSpace)),
            new Vector(this.width, this.getHeight(viewport) - titleSpace)
        );
    }

    private getHeight(viewport: Viewport): number {
        return Math.min(this.height, viewport.height - Config.ui.window.margin * 2);
    }

    private drawTitle(viewport: Viewport) {
        const titleRect = this.getTitleRect(viewport);

        const { ctx } = viewport;

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

    private drawContent(viewport: Viewport) {
        const contentRect = this.getContentRect(viewport);

        const { ctx } = viewport;

        ctx.fillStyle = makeBgGradient(ctx, contentRect);
        contentRect.fill(ctx);

        ctx.strokeStyle = getColorString(config.borderColor);
        ctx.lineWidth = config.borderWidth;
        contentRect.stroke(ctx);
    }

    private getTitleRect(viewport: Viewport): Rectangle {
        let topLeft: Vector;
        const size = new Vector(this.width, config.titleHeight);

        if (this.position == WindowPosition.Absolute) {
            topLeft = this.absolutePosition.add(this.relativePosition);
        }
        else {
            const center = viewport.getCenter();
            topLeft = (
                new Vector(center.x - this.width / 2, center.y - this.getHeight(viewport) / 2)
            ).add(this.relativePosition);
        }

        return new Rectangle(topLeft, size);
    }
}
