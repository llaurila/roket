import { Config } from "./config";
import type { IColor } from "./Graphics/Color";
import { getColorString } from "./Graphics/Color";
import type { Graphics } from "./Graphics/Graphics";
import type IDrawable from "./Graphics/IDrawable";
import type { Viewport } from "./Graphics/Viewport";
import Body from "./Physics/Body";
import type Vector from "./Physics/Vector";
import Ship from "./Ship";

const BUZZ_MIN = 0.05;
const BUZZ_VARIATION = 0.025;

const config = Config.beacon;

const DEFAULT_COLOR: IColor = {
    R: 1,
    G: 0,
    B: 0,
    A: 1
};

export class Beacon extends Body implements IDrawable {
    public graphics?: Graphics;

    private opacity = config.opacityMin;
    private lastBlink = 0;

    private shipDetected = false;

    public constructor(position: Vector, private color: IColor = DEFAULT_COLOR) {
        super(position);
    }

    public canDetectShip(ship: Ship): boolean {
        return this.pos.distanceTo(ship.pos) <= config.detectionRadius;
    }

    public update(time: number, delta: number) {
        super.update(time, delta);

        if (time - this.lastBlink > config.blinkInterval) {
            this.blink();
            this.lastBlink = time;
        }
        else {
            this.fade(delta);
        }

        const ship = this.physics?.getNearestObject<Ship>(this.pos, obj => obj instanceof Ship);
        if (ship) {
            this.shipDetected = this.canDetectShip(ship);
        }
        else {
            this.shipDetected = false;
        }
    }

    public draw(viewport: Viewport) {
        const pos = viewport.toScreenCoordinates(this.pos);
        let radius = viewport.toScreenScale(config.radius);

        const { ctx } = viewport;

        ctx.save();

        const color = { ...this.color, A: this.opacity };
        ctx.fillStyle = getColorString(color);

        ctx.beginPath();
        ctx.arc(
            pos.x,
            pos.y,
            radius,
            0, 2 * Math.PI
        );

        ctx.shadowBlur = radius;
        ctx.shadowColor = getColorString(color);
        ctx.fill();

        ctx.restore();

        if (this.shipDetected) {
            radius = viewport.toScreenScale(config.detectionRadius);

            ctx.save();

            const color = { ...this.color, A: Math.random() * BUZZ_VARIATION + BUZZ_MIN };
            ctx.fillStyle = getColorString(color);

            ctx.beginPath();
            ctx.arc(
                pos.x,
                pos.y,
                radius,
                0, 2 * Math.PI
            );

            ctx.fill();

            ctx.restore();
        }
    }

    private blink() {
        this.opacity = config.opacityMax;
    }

    private fade(delta: number) {
        this.opacity -= delta / config.fadeDuration;
        this.opacity = Math.max(config.opacityMin, this.opacity);
    }
}
