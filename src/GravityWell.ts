import { Config } from "./config";
import { getColorString, type IColor } from "./Graphics/Color";
import type { Graphics } from "./Graphics/Graphics";
import type IDrawable from "./Graphics/IDrawable";
import type { Viewport } from "./Graphics/Viewport";
import Body from "./Physics/Body";
import type IForceField from "./Physics/IForceField";
import Vector from "./Physics/Vector";
import Ship from "./Ship";

const EPSILON = 0.001;

const config = Config.gravityWell;

export class GravityWell extends Body implements IDrawable, IForceField {
    public graphics?: Graphics;

    private time = 0;
    private brightness = 0;

    public constructor(
        position: Vector,
        public range: number,
        public strength: number,
        private color: IColor = config.color
    ) {
        super(position);
    }

    public getForceFor(body: Body): Vector {
        if (body === this) {
            return Vector.Zero;
        }

        const toCenter = this.pos.sub(body.pos);
        const distance = toCenter.length();

        if (distance < EPSILON || distance >= this.range) {
            return Vector.Zero;
        }

        const magnitude = this.strength * (1 - distance / this.range);
        return toCenter.div(distance).mul(magnitude);
    }

    public update(time: number, delta: number): void {
        super.update(time, delta);
        this.time = time;
        this.brightness = this.getBrightness();
    }

    public draw(viewport: Viewport): void {
        const pos = viewport.toScreenCoordinates(this.pos);
        const minRadius = this.range * config.minVisualRadiusRelative;
        const { ctx } = viewport;

        ctx.save();
        ctx.lineWidth = Math.max(config.lineWidth, viewport.toScreenScale(config.lineWidth));

        for (let i = 0; i < config.ringCount; i++) {
            const phase = (this.time * config.animationHz + i / config.ringCount) % 1;
            const worldRadius = minRadius + (this.range - minRadius) * (1 - phase);
            const radius = viewport.toScreenScale(worldRadius);

            const alpha =
                config.opacityMin +
                (1 - phase) * config.opacityRange +
                this.brightness * config.activeOpacityBoost;

            ctx.strokeStyle = getColorString({
                ...this.color,
                A: Math.min(alpha, config.opacityMax)
            });

            ctx.beginPath();
            ctx.arc(pos.x, pos.y, radius, 0, 2 * Math.PI);
            ctx.stroke();
        }

        ctx.restore();
    }

    private getBrightness(): number {
        const ship = this.physics?.getNearestObject<Ship>(
            this.pos,
            obj => obj instanceof Ship
        );

        if (!ship) {
            return 0;
        }

        const distance = this.pos.distanceTo(ship.pos);
        if (distance >= this.range) {
            return 0;
        }

        return 1 - distance / this.range;
    }
}