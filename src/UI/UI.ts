import IDrawable from "../Graphics/IDrawable";
import Camera from "../Graphics/Camera";
import UniqueIdProvider from "../UniqueIdProvider";
import { UIWindow, WindowPosition } from "../UIWindow";
import Vector from "../Physics/Vector";
import Body from "../Physics/Body";
import { Config } from "../config";
import UIDrawer from "./UIDrawer";
import { radToDeg } from "../Utils";
import Level from "../Level";

const config = Config.ui.missionControl;

export class UI implements IDrawable {
    id: number = UniqueIdProvider.next();
    alive = true;

    private window: UIWindow;

    constructor(private level: Level) {
        this.window = new UIWindow(config.windowWidth, Number.MAX_SAFE_INTEGER);

        this.window.title = "MISSION CONTROL";
        this.window.position = WindowPosition.Absolute;
        this.window.absolutePosition = new Vector(Config.ui.window.margin, Config.ui.window.margin);
    }

    draw(ctx: CanvasRenderingContext2D, camera: Camera) {
        const { ship, physics, objectives } = this.level;

        this.window.draw(ctx, camera);

        ctx.save();
        ctx.resetTransform();

        const drawer = new UIDrawer(ctx);

        drawer.drawNumericField("DELTA", getDeltaTimeFormatted(physics.time));
        drawer.drawNumericField("CURRENT VELOCITY", ship.v.length().toFixed(1) + " M/S");

        drawer.drawTitle("POSITION RELATIVE TO BEACON");

        drawer.drawNumericField("BEARING", getBearing(ship, Vector.Zero));
        drawer.drawNumericField("PROXIMITY", ship.pos.length().toFixed());

        drawer.drawTitle("OBJECTIVES");

        for (const objective of objectives) {
            drawer.drawObjective(objective);
        }

        ctx.restore();
    }
}

function getDeltaTimeFormatted(t: number): string {
    const SECS_PER_MIN = 60;

    const s = Math.floor(t);
    const m = Math.floor(s / SECS_PER_MIN);

    return `T+${m}:${String(s % SECS_PER_MIN).padStart(2, "0")}`;
}

function getBearing(body: Body, target: Vector): string {
    const FULL_CIRCLE = 360;

    const v1 = target.sub(body.pos).normalize();
    const v2 = body.v.normalize();

    const dot = v1.dot(v2);
    const det  = v1.cross(v2);

    let angle = radToDeg(Math.atan2(det, dot));

    if (Number.isNaN(angle)) {
        angle = 0;
    }
    else if (angle < 0) {
        angle += FULL_CIRCLE;
    }

    const DIGITS = 3;

    return Math.floor(angle).toFixed().padStart(DIGITS, "0");
}
