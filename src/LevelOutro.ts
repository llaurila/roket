import type IDrawable from "./Graphics/IDrawable";
import UniqueIdProvider from "./UniqueIdProvider";
import type Level from "./Level";
import type IUpdatable from "./Physics/IUpdatable";
import { getDeltaTimeFormatted, getTableRow } from "./text";
import Alert from "./components/UIWindow/Alert";
import type { Viewport } from "./Graphics/Viewport";
import { hasTouchScreen } from "@/Controls/Device";
import Vector from "@/Physics/Vector";

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
        if (hasTouchScreen()) this.addTouchActions();
    }

    public update(time: number, delta: number) {
        this.alert.update(time, delta);
    }

    public draw(viewport: Viewport) {
        if (hasTouchScreen()) {
            this.alert.relativePosition = new Vector(
                viewport.width / 2 - viewport.getCenter().x, 0
            );
        }
        this.alert.draw(viewport);
    }

    private addTouchActions(): void {
        this.alert.actions.items.push({
            text: "RETRY",
            primary: !this.level.passed || !this.level.hasNextLevel,
            onSelect: () => this.level.dispatchEvent(new Event("retry"))
        });
        if (!this.level.passed || !this.level.hasNextLevel) return;

        this.alert.actions.items.push({
            text: "NEXT LEVEL",
            primary: true,
            onSelect: () => this.level.dispatchEvent(new Event("continue"))
        });
    }

    private getSuccessMessage(): string {
        if (hasTouchScreen()) return this.getStatString();

        return this.getStatString() + "\n" +
            "\n" +
            "PRESS <ENTER> TO CONTINUE, <ESC> TO RESTART.";
    }

    private getFailureMessage(): string {
        const failureMessage = this.level.failureMessage || "FAILED TO MEET OBJECTIVE";

        return failureMessage + "\n" +
            "\n" +
            this.getStatString() +
            (hasTouchScreen() ? "" : "\n\nPRESS <ESC> TO RESTART.");
    }

    private getStatString(): string {
        return this.level.stats.toString() + "\n" +
            getTableRow("TIME (DELTA)", getDeltaTimeFormatted(this.level.physics.time));
    }
}

export { LevelOutro };
