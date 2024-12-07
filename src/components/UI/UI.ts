import type IDrawable from "@/Graphics/IDrawable";
import UniqueIdProvider from "@/UniqueIdProvider";
import { UIWindow, WindowPosition } from "@/components/UIWindow";
import Vector from "@/Physics/Vector";
import { Config } from "@/config";
import UIDrawer from "./UIDrawer";
import type Level from "@/Level";
import { getBearing } from "./utils";
import { getDeltaTimeFormatted } from "@/text";
import type { Viewport } from "@/Graphics/Viewport";

const config = Config.ui.missionControl;

export class UI implements IDrawable {
    public id: number = UniqueIdProvider.next();
    public alive = true;

    private window: UIWindow;

    public constructor(private level: Level) {
        this.window = new UIWindow(config.windowWidth, Number.MAX_SAFE_INTEGER);

        this.window.title = "MISSION CONTROL";
        this.window.position = WindowPosition.Absolute;
        this.window.absolutePosition = new Vector(Config.ui.window.margin, Config.ui.window.margin);
    }

    public draw(viewport: Viewport) {
        const { ship, physics, objectives } = this.level;

        this.window.draw(viewport);

        const { ctx } = viewport;

        ctx.save();
        ctx.resetTransform();

        const drawer = new UIDrawer(ctx);

        drawer.drawNumericField("DELTA", getDeltaTimeFormatted(physics.time));

        drawer.drawTitle("SPEED");

        drawer.drawNumericField(
            "CURRENT VELOCITY",
            ship.v.length().toFixed() + " M/S"
        );

        drawer.drawNumericField(
            "ACCELERATION",
            ship.getAcceleration().length().toFixed(1) + " M/S"
        );

        drawer.drawNumericField(
            "ANGULAR VELOCITY",
            ship.angularVelocity.toFixed(1) + " RAD/S"
        );

        drawer.drawTitle("POSITION RELATIVE TO BEACON");

        drawer.drawNumericField("BEARING", getBearing(ship, Vector.Zero));
        drawer.drawNumericField("PROXIMITY", ship.pos.length().toFixed());

        drawer.drawTitle(this.level.name);

        for (const objective of objectives) {
            drawer.drawObjective(objective);
        }

        ctx.restore();
    }
}
