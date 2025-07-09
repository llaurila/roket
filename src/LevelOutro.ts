import type IDrawable from "./Graphics/IDrawable";
import UniqueIdProvider from "./UniqueIdProvider";
import type Level from "./Level";
import type IUpdatable from "./Physics/IUpdatable";
import { getDeltaTimeFormatted, getTableRow } from "./text";
import Alert from "./components/UIWindow/Alert";
import type { Viewport } from "./Graphics/Viewport";

class LevelOutro implements IDrawable, IUpdatable {
    public id: number = UniqueIdProvider.next();
    public alive = true;
    public alert: Alert;

    public constructor(public level: Level) {
        this.alert = new Alert();

        let title, message;

        if (this.level.failureMessage) {
            title = "MISSION FAILED";
            message = this.getFailureMessage();
            this.alert.error = true;
        }
        else {
            title = "MISSION SUCCESS";
            message = this.getSuccessMessage();
        }

        this.alert.title = title;
        this.alert.content = message;
    }

    public update(time: number, delta: number) {
        this.alert.update(time, delta);
    }

    public draw(viewport: Viewport) {
        this.alert.draw(viewport);
    }

    private getSuccessMessage(): string {
        return this.getStatString() + "\n" +
            "\n" +
            "PRESS <ENTER> TO CONTINUE, <ESC> TO RESTART.";
    }

    private getFailureMessage(): string {
        const failureMessage = this.level.failureMessage || "FAILED TO MEET OBJECTIVE";

        return failureMessage + "\n" +
            "\n" +
            this.getStatString() + "\n" +
            "\n" +
            "PRESS <ESC> TO RESTART.";
    }

    private getStatString(): string {
        return this.level.stats.toString() + "\n" +
            getTableRow("TIME (DELTA)", getDeltaTimeFormatted(this.level.physics.time));
    }
}

export { LevelOutro };
