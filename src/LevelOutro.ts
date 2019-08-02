import IDrawable from "./Graphics/IDrawable";
import Camera from "./Graphics/Camera";
import UniqueIdProvider from "./UniqueIdProvider";
import Level from "./Level";
import { getCenter } from "./Utils";

class LevelOutro implements IDrawable {
    id: number = UniqueIdProvider.next();
    level: Level;
    alive: boolean = true;

    constructor(level: Level) {
        this.level = level;
    }

    draw(ctx: CanvasRenderingContext2D, camera: Camera) {
        const center = getCenter(ctx);

        ctx.save();
        ctx.resetTransform();

        ctx.fillStyle = `rgba(241, 241, 241, ${1})`;

        if (this.level.failureMessage) {
            ctx.font = `${22}px Nunito`;
            ctx.textBaseline = "bottom";
            ctx.textAlign = "center";
            ctx.fillText(this.level.failureMessage, center.x, center.y - 10);

            ctx.font = `${18}px Nunito`;
            ctx.textBaseline = "top";
            ctx.textAlign = "center";
            ctx.fillText("Press ESC to restart.", center.x, center.y + 20);
        }
        else if (this.level.passed) {
            ctx.font = `${22}px Nunito`;
            ctx.textBaseline = "bottom";
            ctx.textAlign = "center";
            ctx.fillText("Success!", center.x, center.y - 10);

            ctx.font = `${18}px Nunito`;
            ctx.textBaseline = "top";
            ctx.textAlign = "center";
            ctx.fillText("Press Enter to continue.", center.x, center.y + 20);
        }

        ctx.restore();
    }
}

export { LevelOutro };