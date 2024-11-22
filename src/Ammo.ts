import Body from "./Physics/Body";
import type Vector from "./Physics/Vector";
import type Polygon from "./Graphics/Polygon";
import Shapes from "./Graphics/Shapes";
import type IDrawable from "./Graphics/IDrawable";
import type Camera from "./Graphics/Camera";
import { getColorStringFromRGBA } from "./Graphics/Color";

const SCALE = 0.8;
const DEFAULT_TTL = 5;

class Ammo extends Body implements IDrawable {
    public static Shape: Polygon = Shapes.Ammo.mul(SCALE);

    public ttl = DEFAULT_TTL;

    private age = 0;

    public constructor(position: Vector) {
        super(position);
        this.mass = 1;
    }

    public get alive() {
        return this.age < this.ttl;
    }

    public get relativeAge(): number {
        return this.age / this.ttl;
    }

    public update(time: number, delta: number) {
        super.update(time, delta);
        this.age += delta;
    }

    public draw(ctx: CanvasRenderingContext2D, camera: Camera) {
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
        ctx.fillStyle = getColorStringFromRGBA(1, 0, 0, 1 - this.relativeAge);

        Ammo.Shape.toScreenCoordinates(drawContext).makeClosedPath(ctx);

        ctx.fill();
        ctx.restore();
    }
}

export default Ammo;
