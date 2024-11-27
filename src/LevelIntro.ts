import type IDrawable from "@/Graphics/IDrawable";
import type Camera from "@/Graphics/Camera";
import UniqueIdProvider from "@/UniqueIdProvider";
import type Level from "@/Level";
import type IUpdatable from "@/Physics/IUpdatable";
import Alert from "@/components/UIWindow/Alert";

class LevelIntro implements IDrawable, IUpdatable {
    public id: number = UniqueIdProvider.next();
    public level: Level;
    public opacity = 1;
    public alive = true;
    public alert: Alert;

    public constructor(level: Level) {
        this.level = level;
        this.alert = new Alert();
    }

    public draw(ctx: CanvasRenderingContext2D, camera: Camera) {
        if (camera.pos.x != 0 || camera.pos.y != 0) {
            this.alert.fadeOut = true;
        }
        this.alert.title = this.level.name;
        this.alert.content = this.level.description;

        this.alert.draw(ctx, camera);
    }

    public update(time: number, delta: number) {
        this.alert.update(time, delta);
    }
}

export { LevelIntro };
