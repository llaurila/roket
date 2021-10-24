import IDrawable from "./Graphics/IDrawable";
import UniqueIdProvider from "./UniqueIdProvider";
import Level from "./Level";
import { getCenter } from "./Utils";
import { getGrayHex } from "./Graphics/Color";
import { prepareMessageDraw, prepareTitleDraw, TEXT_LINE_HEIGHT } from "./Typography";

const TEXT_BRIGHTNESS = 0.95;

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

        ctx.fillStyle = getGrayHex(TEXT_BRIGHTNESS);

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

    prepareTitleDraw(ctx);
    ctx.fillText("Success!", center.x, center.y - TEXT_LINE_HEIGHT);

    prepareMessageDraw(ctx);
    ctx.fillText("Press Enter to continue.", center.x, center.y + TEXT_LINE_HEIGHT * 2);
}

function drawFailure(ctx: CanvasRenderingContext2D, message: string) {
    const center = getCenter(ctx);

    prepareTitleDraw(ctx);
    ctx.fillText(message, center.x, center.y - TEXT_LINE_HEIGHT);

    ctx.font = "18px Nunito";
    ctx.textBaseline = "top";
    ctx.textAlign = "center";
    ctx.fillText("Press ESC to restart.", center.x, center.y + TEXT_LINE_HEIGHT * 2);
}


export { LevelOutro };
