import IDrawable from "./Graphics/IDrawable";
import Camera from "./Graphics/Camera";
import Polygon from "./Graphics/Polygon";
import Shapes from "./Graphics/Shapes";
import Body from "./Physics/Body";
import Ship from "./Ship";
import { Graphics } from "./Graphics/Graphics";
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
    static Shape: Polygon = Shapes.Capsule.mul(config.length);

    collected = false;
    private state: State = State.Pulse;
    private opacity = 0;

    amount = config.volume;
    graphics?: Graphics;
    circleCollider = new CircleCollider(config.length / 2 * config.colliderRelativeSize);

    collect(ship: Ship) {
        if (this.collected) {
            return;
        }

        this.collected = true;

        ship.fuelTank.currentAmount =
            Math.min(ship.fuelTank.capacity,
                ship.fuelTank.currentAmount + this.amount);

        this.state = State.FadeOut;
    }

    update(time: number, delta: number) {
        super.update(time, delta);

        if (this.state == State.Dead || !this.alive) {
            return;
        }

        switch (this.state) {
        case State.Pulse:
            this.opacity = config.opacityMin +
                Math.sin(time * Math.PI * 2 * config.pulseHz) *
                    (config.opacityMax - config.opacityMin);
            break;

        case State.FadeOut:
            this.opacity -= delta * (Math.PI * 2 * config.pulseHz);
            if (this.opacity <= 0) {
                this.opacity = 0;
                this.state = State.Dead;
                super._alive = false;
            }
            break;
        }
    }

    draw(ctx: CanvasRenderingContext2D, camera: Camera) {
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
}

export default Fuel;
