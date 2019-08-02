import Body from "../Physics/Body";
import IDrawable from "./IDrawable";
import Camera from "./Camera";
import Vector from "../Physics/Vector";
import { getCenter } from "../Utils";
import IDrawContext from "./IDrawContext";
import Polygon from "./Polygon";
import { getInterpolatedColor } from "./Color";

const FLAME = [
    {
        Color: {
            R: 255,
            G: 255,
            B: 0,
            A: 0.33
        },
        Pos: 0
    },
    {
        Color: {
            R: 255,
            G: 0,
            B: 0,
            A: 0.33
        },
        Pos: 0.25
    },
    {
        Color: {
            R: 255,
            G: 255,
            B: 255,
            A: 0.33
        },
        Pos: 0.5
    },
    {
        Color: {
            R: 255,
            G: 255,
            B: 255,
            A: 0
        },
        Pos: 1
    }
];

class Particle extends Body implements IDrawable {
    static Shape: Polygon = new Polygon([
        new Vector(-1, -1),
        new Vector(+1, -1),
        new Vector(+1, +1),
        new Vector(-1, +1)
    ]);

    age: number = 0;
    ttl: number;

    constructor(position: Vector, ttl: number, angle: number, velocity: number, originVelocity = Vector.Zero) {        
        super(position);

        if (ttl <= 0) {
            throw new Error('Time-to-live needs to be greater than zero.')
        }
        this.ttl = ttl;

        this.v = new Vector(
            velocity * Math.cos(angle),
            -velocity * Math.sin(angle)
        ).add(originVelocity);

        this.mass = 1;
        this.rotation = Math.random() * Math.PI;
    }

    get relativeAge(): number {
        return this.age / this.ttl;
    }
    
    get alive(): boolean {
        return this.age < this.ttl;
    }

    toScreenCoordinates(drawContext: IDrawContext): Vector {
        const origin = getCenter(drawContext.ctx);
        const zoom = drawContext.camera.zoom;

        return this.pos
            .mul(zoom)
            .add(origin)
            .add(drawContext.camera.pos.mul(-1 * zoom));
    }

    draw(ctx: CanvasRenderingContext2D, camera: Camera) {
        const color = getInterpolatedColor(FLAME, this.relativeAge);

        ctx.save();
        ctx.fillStyle = `rgba(${color.R.toFixed()}, ${color.G.toFixed()}, ${color.B.toFixed()}, ${color.A})`;

        Particle.Shape.mul(1 + this.relativeAge).toScreenCoordinates({
            pos: this.pos,
            rotation: this.rotation,
            ctx,
            camera
        }).makeClosedPath(ctx);

        ctx.fill();
        ctx.restore();
    }

    update(time: number, delta: number) {
        if (this.alive) {
            super.update(time, delta);
            this.rotation += delta * 4;
        }
        this.age += delta;
    }
}

export default Particle;