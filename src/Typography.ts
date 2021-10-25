import { Config } from "./config";

const { typography } = Config;

export function prepareTitleDraw(ctx: CanvasRenderingContext2D) {
    ctx.font = `${typography.titleFontSize}px ${typography.fontFamily}`;
    ctx.textBaseline = "bottom";
    ctx.textAlign = "center";
}

export function prepareMessageDraw(ctx: CanvasRenderingContext2D) {
    ctx.font = `${typography.messageFontSize}px ${typography.fontFamily}`;
    ctx.textBaseline = "top";
    ctx.textAlign = "center";
}
