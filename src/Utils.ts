import Vector from "./Physics/Vector";
import IDrawContext from "./Graphics/IDrawContext";

const CCW = 1;
const CW = -1;

function getCenter(ctx: CanvasRenderingContext2D): Vector {
    return new Vector(
        ctx.canvas.width / 2,
        ctx.canvas.height / 2
    );
}

function degToRad(deg: number) {
    return deg * Math.PI / 180;
}

function interpolate(a: number, b: number, p: number) {
    return a + (b-a) * p;
}

function random(min: number, max: number): number {
    return min + Math.random() * (max - min);
}

function drawLine(ctx: CanvasRenderingContext2D, drawContext: IDrawContext, from: Vector, to: Vector) {
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

export {
    CCW,
    CW,
    getCenter,
    degToRad,
    interpolate,
    random,
    drawLine
}