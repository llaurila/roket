import IDrawable from "./Graphics/IDrawable";
import Camera from "./Graphics/Camera";
import UniqueIdProvider from "./UniqueIdProvider";
import Level from "./Level";
import { getCenter } from "./Utils";
import IUpdatable from "./Physics/IUpdatable";
import { prepareMessageDraw, prepareTitleDraw } from "./Typography";
import { Config } from "./config";

const { typography } = Config;

class LevelIntro implements IDrawable, IUpdatable {
    id: number = UniqueIdProvider.next();
    level: Level;
    fadeOut = false;
    opacity = 1;
    alive = true;

    constructor(level: Level) {
        this.level = level;
    }

    draw(ctx: CanvasRenderingContext2D, camera: Camera) {
        if (camera.pos.x != 0 || camera.pos.y != 0) {
            this.fadeOut = true;
        }

        const center = getCenter(ctx);
        const lineHeight = typography.defaultLineHeight;

        ctx.save();
        ctx.resetTransform();

        ctx.fillStyle = `rgba(241, 241, 241, ${this.opacity})`;

        prepareTitleDraw(ctx);
        ctx.fillText(this.level.name, center.x, center.y - lineHeight);

        prepareMessageDraw(ctx);
        ctx.fillText(this.level.description, center.x, center.y + lineHeight * 2);

        ctx.restore();
    }

    update(time: number, delta: number) {
        if (this.fadeOut) {
            this.opacity = Math.max(0, this.opacity - delta);
            if (this.opacity == 0) {
                this.alive = false;
            }
        }
    }
}

export { LevelIntro };
