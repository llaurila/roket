import type IDrawable from "../Graphics/IDrawable";
import type Ship from "../Ship";
import UniqueIdProvider from "../UniqueIdProvider";
import { getColorString, getInterpolatedColor } from "../Graphics/Color";
import { Config } from "../config";

const WIDTH = 120;
const HEIGHT = 12;
const PADDING = 12;

export class FuelGauge implements IDrawable {
    public id: number = UniqueIdProvider.next();

    private _alive = true;

    public constructor(private ship: Ship) {}

    public get alive() {
        return this._alive;
    }

    public draw(ctx: CanvasRenderingContext2D): void {
        const { currentAmount, capacity } = this.ship.fuelTank;
        const relative = currentAmount / capacity;

        const color = getInterpolatedColor([
            { Color: Config.typography.errorColor, Pos: 0 },
            { Color: Config.typography.errorColor, Pos: .2 },
            { Color: Config.typography.defaultColor, Pos: .6 },
            { Color: Config.typography.defaultColor, Pos: 1 }
        ], relative);

        const style = getColorString(color);

        ctx.save();

        ctx.fillStyle = style;
        ctx.strokeStyle = style;

        const x = ctx.canvas.width - PADDING - WIDTH;
        const y = ctx.canvas.height - PADDING - HEIGHT;

        ctx.fillRect(x, y, WIDTH * relative, HEIGHT);
        ctx.strokeRect(x, y, WIDTH, HEIGHT);

        FuelGauge.drawCaption(ctx);

        ctx.restore();
    }

    private static drawCaption(ctx: CanvasRenderingContext2D) {
        ctx.font = `${Config.hud.fontSize}px ${Config.typography.fontFamily}`;
        ctx.textBaseline = "top";
        ctx.textAlign = "right";

        ctx.fillStyle = getColorString(Config.typography.defaultColor);

        ctx.fillText(
            "FUEL",
            ctx.canvas.width - PADDING * 2 - WIDTH,
            ctx.canvas.height - PADDING - HEIGHT
        );
    }
}
