import type IDrawable from "./Graphics/IDrawable";
import type Polygon from "./Graphics/Polygon";
import Shapes from "./Graphics/Shapes";
import ExplosionParticleEngine from "./Graphics/ExplosionParticleEngine";
import Body from "./Physics/Body";
import type Ship from "./Ship";
import type { Graphics } from "./Graphics/Graphics";
import CircleCollider from "./Physics/CircleCollider";
import { getColorString, getInterpolatedColor, type IColor } from "./Graphics/Color";
import { globalSoundEffects } from "./Sounds/global-sound-effects";
import { Config } from "./config";
import type { Viewport } from "./Graphics/Viewport";

enum State {
    Pulse,
    FadeOut,
    Dead
}

const config = Config.fuelCapsule;

const HOT_COLOR: IColor = {
    R: 1,
    G: 0.1,
    B: 0.1,
    A: 1
};

class Fuel extends Body implements IDrawable {
    public static Shape: Polygon = Shapes.Capsule.mul(config.length);

    public collected = false;

    public amount = config.volume;
    public graphics?: Graphics;
    public circleCollider = new CircleCollider(config.length / 2 * config.colliderRelativeSize);

    private state: State = State.Pulse;
    private opacity = 0;
    private heat = 0;

    private collectEvent: Event = new Event("collect");

    public collect(ship: Ship) {
        if (this.collected) {
            return;
        }

        this.collected = true;

        ship.fuelTank.currentAmount =
            Math.min(ship.fuelTank.capacity,
                ship.fuelTank.currentAmount + this.amount);

        this.state = State.FadeOut;

        this.dispatchEvent(this.collectEvent);
    }

    public update(time: number, delta: number) {
        super.update(time, delta);

        if (this.state == State.Dead || !this.alive) {
            return;
        }

        this.coolDown(delta);
        this.updateGfx(time, delta);
    }

    public applyLaserHeat(delta: number): void {
        if (!this.canAbsorbLaserHeat(delta)) {
            return;
        }

        this.heat += delta / config.strength;

        if (this.heat >= 1) {
            this.explodeFromHeat();
        }
    }

    public updateGfx(time: number, delta: number) {
        switch (this.state) {
        case State.Pulse:
            this.pulse(time);
            break;

        case State.FadeOut:
            this.fadeOut(delta);
            break;
        }
    }

    public draw(viewport: Viewport) {
        const drawContext = {
            viewport,
            pos: this.pos,
            rotation: this.rotation
        };

        const { ctx } = viewport;

        ctx.save();
        ctx.lineWidth = 1;

        ctx.strokeStyle = getColorString({
            ...this.getDisplayColor(),
            A: this.opacity
        });

        Fuel.Shape.toScreenCoordinates(drawContext).makeClosedPath(ctx);

        ctx.stroke();
        ctx.restore();
    }

    private pulse(time: number) {
        this.opacity = config.opacityMin +
            Math.sin(time * Math.PI * 2 * config.pulseHz) *
            (config.opacityMax - config.opacityMin);
    }

    private getDisplayColor(): IColor {
        return getInterpolatedColor([
            { Color: config.color, Pos: 0 },
            { Color: HOT_COLOR, Pos: 1 }
        ], Math.min(1, this.heat));
    }

    private coolDown(delta: number): void {
        if (this.state != State.Pulse || this.heat <= 0) {
            return;
        }

        this.heat = Math.max(0, this.heat - config.coolDownPerSecond * delta);
    }

    private canAbsorbLaserHeat(delta: number): boolean {
        return this.state == State.Pulse && !this.collected && this.alive && delta > 0;
    }

    private explodeFromHeat(): void {
        this.spawnExplosion();
        globalSoundEffects.playExplosionSound(config.explosionSoundDuration);
        this.state = State.Dead;
        this._alive = false;
    }

    private spawnExplosion(): void {
        if (!this.physics || !this.graphics) {
            return;
        }

        const explosion = new ExplosionParticleEngine(this.pos, {
            particleCount: config.explosionParticleCount,
            velocityMin: 0,
            velocityMax: config.explosionVelocityMax,
            originVelocity: this.v
        });

        this.physics.add(explosion);
        this.graphics.add(explosion);
    }

    private fadeOut(delta: number) {
        this.opacity -= delta * (Math.PI * 2 * config.pulseHz);
        if (this.opacity <= 0) {
            this.opacity = 0;
            this.state = State.Dead;
            this._alive = false;
        }
    }
}

export default Fuel;
