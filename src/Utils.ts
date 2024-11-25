import Vector from "./Physics/Vector";
import type IDrawContext from "./Graphics/IDrawContext";
import { Config } from "./config";
import { toScreenCoordinates } from "./Graphics/projection";

export const CCW = 1;
export const CW = -1;

const HALF_CIRCLE = 180;

export function getCenter(ctx: CanvasRenderingContext2D): Vector {
    return new Vector(
        ctx.canvas.width / 2 + Config.ui.missionControl.windowWidth / 2,
        ctx.canvas.height / 2
    );
}

export function degToRad(deg: number) {
    return deg * Math.PI / HALF_CIRCLE;
}

export function radToDeg(rad: number) {
    return rad * HALF_CIRCLE / Math.PI;
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
        screenFrom = toScreenCoordinates(from, drawContext),
        screenTo = toScreenCoordinates(to, drawContext);

    ctx.save();
    ctx.lineWidth = 1;
    ctx.strokeStyle = "red";
    ctx.beginPath();
    ctx.moveTo(screenFrom.x, screenFrom.y);
    ctx.lineTo(screenTo.x, screenTo.y);
    ctx.stroke();
    ctx.restore();
}

export function formatDistance(n: number): string {
    const LONG = 10000;
    const MID = 1000;

    let v;
    let u = "M";

    if (n >= LONG) {
        v = (n / 1000).toFixed();
        u = "KM";
    }
    else if (n >= MID) {
        v = (n / 1000).toFixed(1);
        u = "KM";
    }
    else {
        v = n.toFixed();
    }

    return v + " " + u;
}
