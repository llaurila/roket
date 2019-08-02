import IDrawable from "./Graphics/IDrawable";
import Camera from "./Graphics/Camera";
import UniqueIdProvider from "./UniqueIdProvider";
import Level from "./Level";
import { getCenter } from "./Utils";
import IUpdatable from "./Physics/IUpdatable";

class LevelIntro implements IDrawable, IUpdatable {
    id: number = UniqueIdProvider.next();
    level: Level;
    fadeOut: boolean = false;
    opacity: number = 1;
    alive: boolean = true;

    constructor(level: Level) {
        this.level = level;
    }

    draw(ctx: CanvasRenderingContext2D, camera: Camera) {
        if (camera.pos.x != 0 || camera.pos.y != 0) {
            this.fadeOut = true;
        }

        const center = getCenter(ctx);

        ctx.save();
        ctx.resetTransform();

        ctx.fillStyle = `rgba(241, 241, 241, ${this.opacity})`;

        ctx.font = `${22}px Nunito`;
        ctx.textBaseline = "bottom";
        ctx.textAlign = "center";
        ctx.fillText(this.level.name, center.x, center.y - 10);

        ctx.font = `${18}px Nunito`;
        ctx.textBaseline = "top";
        ctx.textAlign = "center";
        ctx.fillText(this.level.description, center.x, center.y + 20);

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