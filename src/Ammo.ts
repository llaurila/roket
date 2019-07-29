import Body from "./Body";
import Vector from "./Vector";
import Polygon from "./Polygon";
import Shapes from "./Shapes";
import IDrawable from "./IDrawable";
import Camera from "./Camera";

const SCALE = 0.8;

class Ammo extends Body implements IDrawable {
    static Shape: Polygon = Shapes.Ammo.mul(SCALE);

    ttl: number = 5;
    private age: number = 0;
    
    constructor(position: Vector) {
        super(position);
        this.mass = 1;
    }

    update(time: number, delta: number) {
        super.update(time, delta);
        this.age += delta;
    }

    get alive() {
        return this.age < this.ttl;
    }

    get relativeAge(): number {
        return this.age / this.ttl;
    }

    draw(ctx: CanvasRenderingContext2D, camera: Camera) {
        if (!this.alive) {
            return;
        }

        const drawContext = {
            pos: this.pos,
            rotation: this.rotation,
            ctx,
            camera
        };

        ctx.save();
        ctx.fillStyle = `rgba(255, 0, 0, ${1 - this.relativeAge})`;

        Ammo.Shape.toScreenCoordinates(drawContext).makeClosedPath(ctx);

        ctx.fill();
        ctx.restore();
    }
}

export default Ammo;