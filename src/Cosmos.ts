import IDrawable from "./Graphics/IDrawable";
import Camera from "./Graphics/Camera";
import Vector from "./Physics/Vector";
import UniqueIdProvider from "./UniqueIdProvider";
import { random } from "./Utils";
import { Config } from "./config";

const SEGMENT_SIZE = 200;

interface IStar {
    pos: Vector;
    size: number;
    opacity: number;
}

interface IStarSegment {
    stars: IStar[];
}

const config = Config.cosmos;

class Cosmos implements IDrawable {
    id: number = UniqueIdProvider.next();
    starSegments: { [key: string]: IStarSegment } = {};

    readonly _alive = true;

    get alive() {
        return this._alive;
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

                for (const star of segment.stars) {
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
        const key = x + "," + y;
        let segment: IStarSegment = this.starSegments[key];

        if (!segment) {
            segment = {
                stars: generateStars(x, y)
            };
            this.starSegments[key] = segment;
        }

        return segment;
    }
}

function generateStars(x: number, y: number) {
    const stars: IStar[] = [];

    const origin = new Vector(x, y).mul(SEGMENT_SIZE);

    const segmentArea = SEGMENT_SIZE * SEGMENT_SIZE;
    const SQ_KM = 1000 * 1000;

    const starsPerSegment = segmentArea / SQ_KM * config.starDensity;

    for (let i = 0; i < starsPerSegment; i++) {
        stars.push({
            pos: origin.add(new Vector(
                Math.random(),
                Math.random()
            ).mul(SEGMENT_SIZE)),
            size: 1 + Math.random() * 2,
            opacity: random(config.starBrighnessMin, config.starBrighnessMax)
        });
    }

    return stars;
}

export default Cosmos;
