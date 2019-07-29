import IDrawable from "./IDrawable";
import Camera from "./Camera";
import Polygon from "./Polygon";
import Shapes from "./Shapes";
import Body from "./Body";
import Vector from "./Vector";
import Ship from "./Ship";

class Fuel extends Body implements IDrawable {
    static Shape: Polygon = Shapes.Capsule;

    collected: boolean = false;

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
    }

    draw(ctx: CanvasRenderingContext2D, camera: Camera) {
        if (this.collected || !this.alive) {
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
        ctx.strokeStyle = "#00ff00";

        Fuel.Shape.toScreenCoordinates(drawContext).makeClosedPath(ctx);

        ctx.stroke();
        ctx.restore();
    }

    get alive() {
        return true;
    }
}

export default Fuel;