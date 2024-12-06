import Vector from "./Physics/Vector";
import type IDrawContext from "./Graphics/IDrawContext";
import { Config } from "./config";
import { toScreenCoordinates } from "./Graphics/projection";

const DEG_HALF_CIRCLE = 180;
const DEG_QUARTER_CIRCLE = 90;

export const CCW = 1;
export const CW = -1;

export interface DistanceFormat {
    value: string;
    unit: string;
}

export const DEG90 = degToRad(DEG_QUARTER_CIRCLE);

export function getCenter(ctx: CanvasRenderingContext2D): Vector {
    return new Vector(
        ctx.canvas.width / 2 + Config.ui.missionControl.windowWidth / 2,
        ctx.canvas.height / 2
    );
}

export function degToRad(deg: number) {
    return deg * Math.PI / DEG_HALF_CIRCLE;
}

export function radToDeg(rad: number) {
    return rad * DEG_HALF_CIRCLE / Math.PI;
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

export function getDistanceFormat(n: number): DistanceFormat {
    const LONG = 10000;
    const MID = 1000;

    const fmt: DistanceFormat = {
        value: "",
        unit: "M"
    };

    if (n >= LONG) {
        fmt.value = (n / 1000).toFixed();
        fmt.unit = "KM";
    }
    else if (n >= MID) {
        fmt.value = (n / 1000).toFixed(1);
        fmt.unit = "KM";
    }
    else {
        fmt.value = n.toFixed();
    }

    return fmt;
}

export function formatString(template: string, values: Record<string, string>) {
    return template.replace(/\${(.*?)}/g, (_, key: string) => values[key]);
}
