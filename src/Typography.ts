export const TEXT_LINE_HEIGHT = 10;

export function prepareTitleDraw(ctx: CanvasRenderingContext2D) {
    ctx.font = "22px Nunito";
    ctx.textBaseline = "bottom";
    ctx.textAlign = "center";
}

export function prepareMessageDraw(ctx: CanvasRenderingContext2D) {
    ctx.font = "18px Nunito";
    ctx.textBaseline = "top";
    ctx.textAlign = "center";
}
