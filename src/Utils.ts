import Vector from "./Physics/Vector";
import IDrawContext from "./Graphics/IDrawContext";

export const CCW = 1;
export const CW = -1;

export function getCenter(ctx: CanvasRenderingContext2D): Vector {
    return new Vector(
        ctx.canvas.width / 2,
        ctx.canvas.height / 2
    );
}

export function degToRad(deg: number) {
    const HALF_CIRCLE = 180;
    return deg * Math.PI / HALF_CIRCLE;
}

export function interpolate(a: number, b: number, p: number) {
    return a + (b - a) * p;
}

export function random(min: number, max: number): number {
    return min + Math.random() * (max - min);
}

export function drawLine(
    ctx: CanvasRenderingContext2D,
    drawContext: IDrawContext,
    from: Vector,
    to: Vector
): void
{
    const
        screenFrom = from.toScreenCoordinates(drawContext),
        screenTo = to.toScreenCoordinates(drawContext);

    ctx.save();
    ctx.lineWidth = 1;
    ctx.strokeStyle = "red";
    ctx.beginPath();
    ctx.moveTo(screenFrom.x, screenFrom.y);
    ctx.lineTo(screenTo.x, screenTo.y);
    ctx.stroke();
    ctx.restore();
}
