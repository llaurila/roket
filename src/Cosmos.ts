import IDrawable from "./IDrawable";
import Camera from "./Camera";
import Vector from "./Vector";

interface IStar {
    pos: Vector;
    size: number;
    opacity: number;
}

class Cosmos implements IDrawable {
    stars: IStar[];

    constructor() {
        this.stars = [];
        for (let i = 0; i < 100; i++) {
            this.stars.push({
                pos: new Vector(
                    Math.random(),
                    Math.random()    
                ),
                size: Math.random() * 200,
                opacity: Math.random() * 0.5 + 0.25
            })
        }
    }

    draw(ctx: CanvasRenderingContext2D, camera: Camera) {
        const
            w = ctx.canvas.width,
            h = ctx.canvas.height,
            max = Math.max(w, h);

        ctx.save();

        for (let star of this.stars) {
            const p = star.pos.mul(max);

            ctx.fillStyle = `rgba(255, 255, 255, ${star.opacity})`;
            ctx.beginPath();
            ctx.arc(p.x, p.y, star.size * camera.zoom / 1000, 0, 2 * Math.PI);
            ctx.fill();
        }

        ctx.restore();
    }
}

export default Cosmos;