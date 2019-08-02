import IDrawable from "./Graphics/IDrawable";
import Camera from "./Graphics/Camera";
import Vector from "./Physics/Vector";
import UniqueIdProvider from "./UniqueIdProvider";

const SEGMENT_SIZE = 200;
const STARS_PER_SEGMENT = 12;

interface IStar {
    pos: Vector;
    size: number;
    opacity: number;
}

interface IStarSegment {
    stars: IStar[];
}

class Cosmos implements IDrawable {
    id: number = UniqueIdProvider.next();
    starSegments: any = {};

    get alive() {
        return true;
    }

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
        let key = x + "," + y;
        let segment: IStarSegment = this.starSegments[key];

        if (!segment) {
            segment = {
                stars: generateStars(x, y)
            }
            this.starSegments[key] = segment;
        }

        return segment;
    }
}

function generateStars(x: number, y: number) {
    let stars: IStar[] = [];

    const origin = new Vector(x, y).mul(SEGMENT_SIZE);

    for (let i = 0; i < STARS_PER_SEGMENT; i++) {
        stars.push({
            pos: origin.add(new Vector(
                Math.random(),
                Math.random()
            ).mul(SEGMENT_SIZE)),
            size: 1 + Math.random() * 2,
            opacity: 0.25 + Math.random() * 0.75
        });
    }

    return stars;
}

export default Cosmos;