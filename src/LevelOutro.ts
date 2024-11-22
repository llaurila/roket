import type IDrawable from "./Graphics/IDrawable";
import UniqueIdProvider from "./UniqueIdProvider";
import type Level from "./Level";
import Alert from "./UIWindow/Alert";
import type IUpdatable from "./Physics/IUpdatable";
import type Camera from "./Graphics/Camera";

class LevelOutro implements IDrawable, IUpdatable {
    public id: number = UniqueIdProvider.next();
    public level: Level;
    public alive = true;
    public alert: Alert;

    public constructor(level: Level) {
        this.level = level;
        this.alert = new Alert();
    }

    public draw(ctx: CanvasRenderingContext2D, camera: Camera) {
        let title = "MISSION SUCCESS";
        let message = "PRESS <ENTER> TO CONTINUE.";

        if (this.level.failureMessage) {
            title = "MISSION FAILED";
            message = this.level.failureMessage + " PRESS <ESC> TO RESTART.";
        }

        this.alert.title = title;
        this.alert.content = message;
        this.alert.error = Boolean(this.level.failureMessage);

        this.alert.draw(ctx, camera);
    }

    public update(time: number, delta: number) {
        this.alert.update(time, delta);
    }
}

export { LevelOutro };
