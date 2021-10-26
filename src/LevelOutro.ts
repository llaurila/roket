import IDrawable from "./Graphics/IDrawable";
import UniqueIdProvider from "./UniqueIdProvider";
import Level from "./Level";
import Alert from "./UIWindow/Alert";
import IUpdatable from "./Physics/IUpdatable";
import Camera from "./Graphics/Camera";

class LevelOutro implements IDrawable, IUpdatable {
    id: number = UniqueIdProvider.next();
    level: Level;
    alive = true;

    alert: Alert;

    constructor(level: Level) {
        this.level = level;
        this.alert = new Alert();
    }

    draw(ctx: CanvasRenderingContext2D, camera: Camera) {
        let title = "MISSION SUCCESS";
        let message = "PRESS <ENTER> TO CONTINUE.";

        if (this.level.failureMessage) {
            title = "MISSION FAILED";
            message = this.level.failureMessage + " " + message;
        }

        this.alert.title = title;
        this.alert.content = message;
        this.alert.error = Boolean(this.level.failureMessage);

        this.alert.draw(ctx, camera);
    }

    update(time: number, delta: number) {
        this.alert.update(time, delta);
    }
}

export { LevelOutro };
