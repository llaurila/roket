import type IDrawable from "../Graphics/IDrawable";
import UniqueIdProvider from "../UniqueIdProvider";
import { getColorString, getInterpolatedColor } from "../Graphics/Color";
import { Config } from "../config";

const WIDTH = Config.barGauge.width;
const HEIGHT = Config.barGauge.height;
const PADDING = Config.barGauge.padding;
const CAPTION_OFFSET = Config.barGauge.captionOffset;

const LINE_HEIGHT = HEIGHT + PADDING * 1;

type Getter<T> = () => T;

export enum BarGaugeAnchor {
    Top,
    Bottom
}

export class BarGauge implements IDrawable {
    public id: number = UniqueIdProvider.next();

    private _alive = true;

    public constructor(
        private caption: string|Getter<string>,
        private getCurrent: () => number,
        private getMax: Getter<number>,
        private anchor: BarGaugeAnchor,
        private index: number
    ) {}

    public get alive() {
        return this._alive;
    }

    public draw(ctx: CanvasRenderingContext2D): void {
        const max = this.getMax();
        const value = Math.max(Math.min(this.getCurrent(), max), 0);
        const relative = value / max;

        const color = getInterpolatedColor([
            { Color: Config.barGauge.minColor, Pos: 0 },
            { Color: Config.barGauge.halfColor, Pos: .25 },
            { Color: Config.barGauge.maxColor, Pos: .5 },
            { Color: Config.barGauge.maxColor, Pos: 1 }
        ], relative);

        const style = getColorString(color);

        ctx.save();

        ctx.fillStyle = style;
        ctx.strokeStyle = style;

        const x = ctx.canvas.width - PADDING - WIDTH;
        const y = this.getOriginY(ctx) + (PADDING + HEIGHT + this.getOffSetY()) * this.getMulY();

        ctx.fillRect(x, y, WIDTH * relative, HEIGHT);
        ctx.strokeRect(x, y, WIDTH, HEIGHT);

        this.drawCaption(ctx);

        ctx.restore();
    }

    private getOriginY(ctx: CanvasRenderingContext2D) {
        if (this.anchor === BarGaugeAnchor.Bottom) {
            return ctx.canvas.height;
        }
        return -PADDING;
    }

    private getOffSetY = () => this.index * LINE_HEIGHT;

    private getMulY = () => this.anchor === BarGaugeAnchor.Top ? 1 : -1;

    private drawCaption(ctx: CanvasRenderingContext2D) {
        ctx.font = `${Config.hud.fontSize}px ${Config.typography.fontFamily}`;
        ctx.textBaseline = "top";
        ctx.textAlign = "right";

        ctx.fillStyle = getColorString(Config.typography.defaultColor);

        let caption: string;
        if (typeof this.caption === "function") {
            caption = this.caption();
        }
        else {
            caption = this.caption;
        }

        ctx.fillText(
            caption,
            ctx.canvas.width - PADDING - WIDTH - CAPTION_OFFSET,
            this.getOriginY(ctx) + (PADDING + HEIGHT + this.getOffSetY()) * this.getMulY()
        );
    }
}
