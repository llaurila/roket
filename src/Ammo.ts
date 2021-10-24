import Body from "./Physics/Body";
import Vector from "./Physics/Vector";
import Polygon from "./Graphics/Polygon";
import Shapes from "./Graphics/Shapes";
import IDrawable from "./Graphics/IDrawable";
import Camera from "./Graphics/Camera";
import { getColorHexFromRGBA } from "./Graphics/Color";

const SCALE = 0.8;
const DEFAULT_TTL = 5;

class Ammo extends Body implements IDrawable {
    static Shape: Polygon = Shapes.Ammo.mul(SCALE);

    ttl = DEFAULT_TTL;
    private age = 0;

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
        ctx.fillStyle = getColorHexFromRGBA(1, 0, 0, 1 - this.relativeAge);

        Ammo.Shape.toScreenCoordinates(drawContext).makeClosedPath(ctx);

        ctx.fill();
        ctx.restore();
    }
}

export default Ammo;
