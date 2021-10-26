import IDrawable from "./Graphics/IDrawable";
import Camera from "./Graphics/Camera";
import UniqueIdProvider from "./UniqueIdProvider";
import Level from "./Level";
import IUpdatable from "./Physics/IUpdatable";
import Alert from "./UIWindow/Alert";

class LevelIntro implements IDrawable, IUpdatable {
    id: number = UniqueIdProvider.next();
    level: Level;
    opacity = 1;
    alive = true;

    alert: Alert;

    constructor(level: Level) {
        this.level = level;
        this.alert = new Alert();
    }

    draw(ctx: CanvasRenderingContext2D, camera: Camera) {
        if (camera.pos.x != 0 || camera.pos.y != 0) {
            this.alert.fadeOut = true;
        }
        this.alert.title = this.level.name;
        this.alert.content = this.level.description;

        this.alert.draw(ctx, camera);
    }

    update(time: number, delta: number) {
        this.alert.update(time, delta);
    }
}

export { LevelIntro };
