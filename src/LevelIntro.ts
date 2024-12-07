import type IDrawable from "@/Graphics/IDrawable";
import UniqueIdProvider from "@/UniqueIdProvider";
import type Level from "@/Level";
import type IUpdatable from "@/Physics/IUpdatable";
import Alert from "@/components/UIWindow/Alert";
import type { Viewport } from "./Graphics/Viewport";

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

    public draw(viewport: Viewport) {
        const { camera } = viewport;

        if (camera.pos.x != 0 || camera.pos.y != 0) {
            this.alert.fadeOut(
                () => this.alive = false
            );
        }

        this.alert.title = this.level.name;
        this.alert.content = this.level.description;

        this.alert.draw(viewport);
    }

    public update(time: number, delta: number) {
        this.alert.update(time, delta);
    }
}

export { LevelIntro };
