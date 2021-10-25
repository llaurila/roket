import IDrawable from "./Graphics/IDrawable";
import UniqueIdProvider from "./UniqueIdProvider";
import Level from "./Level";
import { getCenter } from "./Utils";
import { prepareMessageDraw, prepareTitleDraw } from "./Typography";
import { Config } from "./config";
import { getColorHex } from "./Graphics/Color";

const { typography } = Config;

class LevelOutro implements IDrawable {
    id: number = UniqueIdProvider.next();
    level: Level;
    alive = true;

    constructor(level: Level) {
        this.level = level;
    }

    draw(ctx: CanvasRenderingContext2D) {
        ctx.save();
        ctx.resetTransform();

        ctx.fillStyle = getColorHex(typography.defaultColor);

        if (this.level.failureMessage) {
            drawFailure(ctx, this.level.failureMessage);
        }
        else if (this.level.passed) {
            drawSuccess(ctx);
        }

        ctx.restore();
    }
}

function drawSuccess(ctx: CanvasRenderingContext2D) {
    const center = getCenter(ctx);
    const lineHeight = typography.defaultLineHeight;

    prepareTitleDraw(ctx);
    ctx.fillText("Success!", center.x, center.y - lineHeight);

    prepareMessageDraw(ctx);
    ctx.fillText("Press Enter to continue.", center.x, center.y + lineHeight * 2);
}

function drawFailure(ctx: CanvasRenderingContext2D, message: string) {
    const center = getCenter(ctx);
    const lineHeight = typography.defaultLineHeight;

    prepareTitleDraw(ctx);
    ctx.fillText(message, center.x, center.y - lineHeight);

    prepareMessageDraw(ctx);
    ctx.fillText("Press ESC to restart.", center.x, center.y + lineHeight * 2);
}


export { LevelOutro };
