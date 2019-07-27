import IDrawable from "./IDrawable";
import Camera from "./Camera";
import Vector from "./Vector";

const SEGMENT_SIZE = 100;

interface IStar {
    pos: Vector;
    size: number;
    opacity: number;
}

interface IStarSegment {
    stars: IStar[];
}

class Cosmos implements IDrawable {
    starSegments: IStarSegment[] = [];

    draw(ctx: CanvasRenderingContext2D, camera: Camera) {
        const
            bottomLeft = camera.toWorldCoordinates(
                ctx, new Vector(0, ctx.canvas.height)),
            topRight = camera.toWorldCoordinates(
                ctx, new Vector(ctx.canvas.width, 0));

        const
            bottomLeftSegment = bottomLeft.div(SEGMENT_SIZE).floor(),
            topRightSegment = topRight.div(SEGMENT_SIZE).ceil();

        ctx.save();

        for (let x = bottomLeftSegment.x; x <= topRightSegment.x; x++) {
            for (let y = bottomLeftSegment.y; y <= topRightSegment.y; y++) {
                const segment = this.getSegment(x, y);
                
                for (let star of segment.stars) {
                    const p = camera.toScreenCoordinates(ctx, star.pos);
                    ctx.fillStyle = `rgba(255, 255, 255, ${star.opacity})`;
                    ctx.beginPath();
                    ctx.arc(p.x, p.y, star.size, 0, 2 * Math.PI);
                    ctx.fill();
                }
            }    
        }

        ctx.restore();
    }

    getSegment(x: number, y: number): IStarSegment {
        return {
            stars: [{
                pos: new Vector(x, y).mul(SEGMENT_SIZE),
                size: 2,
                opacity: 0.5
            }]
        };
    }
}

export default Cosmos;