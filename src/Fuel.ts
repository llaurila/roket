import IDrawable from "./Graphics/IDrawable";
import Camera from "./Graphics/Camera";
import Polygon from "./Graphics/Polygon";
import Shapes from "./Graphics/Shapes";
import Body from "./Physics/Body";
import Ship from "./Ship";
import { Graphics } from "./Graphics/Graphics";
import CircleCollider from "./Physics/CircleCollider";
import { getColorHexFromRGBA } from "./Graphics/Color";

const AMOUNT_OF_FUEL = 25;
const COLLIDER_RADIUS = 5;
const OPACITY_MIN = 0.75;
const OPACITY_MAX = 1.00;
const PULSE_HZ = 0.5;

enum State {
    Pulse,
    FadeOut,
    Dead
}

class Fuel extends Body implements IDrawable {
    static Shape: Polygon = Shapes.Capsule;

    collected = false;
    private state: State = State.Pulse;
    private opacity = 0;

    amount = AMOUNT_OF_FUEL;
    graphics?: Graphics;
    circleCollider = new CircleCollider(COLLIDER_RADIUS);

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
            this.opacity = OPACITY_MIN +
                Math.sin(time * Math.PI * 2 * PULSE_HZ) * (OPACITY_MAX - OPACITY_MIN);
            break;

        case State.FadeOut:
            this.opacity -= delta * (Math.PI * 2 * PULSE_HZ);
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
        ctx.strokeStyle = getColorHexFromRGBA(0, 1, 0, this.opacity);

        Fuel.Shape.toScreenCoordinates(drawContext).makeClosedPath(ctx);

        ctx.stroke();
        ctx.restore();
    }
}

export default Fuel;
