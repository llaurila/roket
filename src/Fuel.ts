import IDrawable from "./IDrawable";
import Camera from "./Camera";
import Polygon from "./Polygon";
import Shapes from "./Shapes";
import Body from "./Body";
import Vector from "./Vector";
import Ship from "./Ship";

enum State {
    Pulse,
    FadeOut,
    Dead
}

class Fuel extends Body implements IDrawable {
    static Shape: Polygon = Shapes.Capsule;

    private collected: boolean = false;
    private state: State = State.Pulse;
    private opacity: number = 0;

    constructor(position: Vector) {
        super(position);
        this.mass = 25;
    }

    collect(ship: Ship) {
        if (this.collected) {
            return;
        }

        this.collected = true;
        this._alive = false;
        
        ship.fuelTank.currentAmount =
            Math.min(ship.fuelTank.capacity,
                ship.fuelTank.currentAmount + this.mass);

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
            }
            break;
        }
    }

    draw(ctx: CanvasRenderingContext2D, camera: Camera) {
        if (this.state == State.Dead) {
            return;
        }

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

    get alive() {
        return true;
    }
}

export default Fuel;