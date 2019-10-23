import IDrawable from "./Graphics/IDrawable";
import Camera from "./Graphics/Camera";
import Polygon from "./Graphics/Polygon";
import Shapes from "./Graphics/Shapes";
import Body from "./Physics/Body";
import Ship from "./Ship";
import { Graphics } from "./Graphics/Graphics";
import CircleCollider from "./Physics/CircleCollider";

enum State {
    Pulse,
    FadeOut,
    Dead
}

class Fuel extends Body implements IDrawable {
    static Shape: Polygon = Shapes.Capsule;

    collected: boolean = false;
    private state: State = State.Pulse;
    private opacity: number = 0;

    amount: number = 25;
    graphics?: Graphics;
    circleCollider = new CircleCollider(5);

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
            this.opacity = 0.75 + Math.sin(time * 4) * 0.25;
            break;
        
        case State.FadeOut:
            this.opacity -= delta * 4;
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
        ctx.strokeStyle = `rgba(0, 255, 0, ${this.opacity})`;

        Fuel.Shape.toScreenCoordinates(drawContext).makeClosedPath(ctx);

        ctx.stroke();
        ctx.restore();
    }
}

export default Fuel;