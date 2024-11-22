import { getColorString } from "../Graphics/Color";
import type Rectangle from "../Graphics/Rectangle";
import { Config } from "../config";

const config = Config.ui.window;

export function makeBgGradient(
    ctx: CanvasRenderingContext2D,
    rect: Rectangle
) {
    const grd = ctx.createLinearGradient(0, rect.topLeft.y, 0, rect.topLeft.y + rect.size.y);
    grd.addColorStop(0, getColorString(config.backgroundColorTop));
    grd.addColorStop(1, getColorString(config.backgroundColorBottom));
    return grd;
}
