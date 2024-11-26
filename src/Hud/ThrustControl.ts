import { Config } from "../config";
import type Camera from "../Graphics/Camera";
import { getColorString } from "../Graphics/Color";
import type IDrawable from "../Graphics/IDrawable";
import Rectangle from "../Graphics/Rectangle";
import Shapes from "../Graphics/Shapes";
import Vector from "../Physics/Vector";
import type Ship from "../Ship";
import { makeBgGradient } from "../UIWindow/utils";
import UniqueIdProvider from "../UniqueIdProvider";

const MARKER_SCALE = 4;

const HEIGHT = 120;
const WIDTH = 12;
const MARGIN = 40;
const OFFSET_X = Config.ui.missionControl.windowWidth + MARGIN + MARKER_SCALE * 2;

const MARKER_OFFSET = 22;
const MARKER_ORIGIN_LEFT = new Vector(WIDTH / 2 - MARKER_OFFSET, HEIGHT);
const MARKER_ORIGIN_RIGHT = new Vector(WIDTH / 2 + MARKER_OFFSET, HEIGHT);

const SHAPE_LEFT = Shapes.Triangle.mul(MARKER_SCALE);
const SHAPE_RIGHT = Shapes.Triangle.rotate(Math.PI).mul(MARKER_SCALE);

const CAPTION_OFFSET = 15;

export class ThrustControl implements IDrawable {
    public readonly id: number = UniqueIdProvider.next();
    public readonly alive = true;

    public constructor(private ship: Ship) {}

    public draw(ctx: CanvasRenderingContext2D, _camera: Camera) {
        if (!this.ship.alive) return;

        ctx.save();

        const rect = new Rectangle(
            new Vector(OFFSET_X, ctx.canvas.height - MARGIN - HEIGHT),
            new Vector(WIDTH, HEIGHT)
        );

        ctx.fillStyle = makeBgGradient(ctx, rect);
        rect.fill(ctx);

        ctx.strokeStyle = getColorString(Config.ui.window.borderColor);
        ctx.lineWidth = Config.ui.window.borderWidth;
        rect.stroke(ctx);

        ctx.fillStyle = getColorString(Config.ui.window.borderColor);

        SHAPE_LEFT
            .translate(
                rect.topLeft.add(MARKER_ORIGIN_LEFT.add(
                    Vector.Down.mul(HEIGHT * this.ship.engineLeft.relativeOutput)
                ))
            )
            .makeClosedPath(ctx);

        ctx.fill();

        SHAPE_RIGHT
            .translate(
                rect.topLeft.add(MARKER_ORIGIN_RIGHT.add(
                    Vector.Down.mul(HEIGHT * this.ship.engineRight.relativeOutput)
                ))
            )
            .makeClosedPath(ctx);

        ctx.fill();

        ctx.font = `${Config.hud.fontSize}px ${Config.typography.fontFamily}`;
        ctx.textBaseline = "top";
        ctx.textAlign = "center";

        ctx.fillStyle = getColorString(Config.typography.defaultColor);

        ctx.fillText(
            "THROTTLE",
            rect.topLeft.x + WIDTH / 2,
            rect.bottomRight.y + CAPTION_OFFSET
        );

        ctx.restore();
    }
}
