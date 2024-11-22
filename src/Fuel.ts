import type IDrawable from "./Graphics/IDrawable";
import type Camera from "./Graphics/Camera";
import type Polygon from "./Graphics/Polygon";
import Shapes from "./Graphics/Shapes";
import Body from "./Physics/Body";
import type Ship from "./Ship";
import type { Graphics } from "./Graphics/Graphics";
import CircleCollider from "./Physics/CircleCollider";
import { getColorString } from "./Graphics/Color";
import { Config } from "./config";

enum State {
    Pulse,
    FadeOut,
    Dead
}

const config = Config.fuelCapsule;

class Fuel extends Body implements IDrawable {
    public static Shape: Polygon = Shapes.Capsule.mul(config.length);

    public collected = false;

    public amount = config.volume;
    public graphics?: Graphics;
    public circleCollider = new CircleCollider(config.length / 2 * config.colliderRelativeSize);

    private state: State = State.Pulse;
    private opacity = 0;

    public collect(ship: Ship) {
        if (this.collected) {
            return;
        }

        this.collected = true;

        ship.fuelTank.currentAmount =
            Math.min(ship.fuelTank.capacity,
                ship.fuelTank.currentAmount + this.amount);

        this.state = State.FadeOut;
    }

    public update(time: number, delta: number) {
        super.update(time, delta);

        if (this.state == State.Dead || !this.alive) {
            return;
        }

        this.updateGfx(time, delta);
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

    public draw(ctx: CanvasRenderingContext2D, camera: Camera) {
        const drawContext = {
            pos: this.pos,
            rotation: this.rotation,
            ctx,
            camera
        };

        ctx.save();
        ctx.lineWidth = 1;

        ctx.strokeStyle = getColorString({
            ...config.color,
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
