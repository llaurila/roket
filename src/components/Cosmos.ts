import type IDrawable from "../Graphics/IDrawable";
import Vector from "../Physics/Vector";
import UniqueIdProvider from "../UniqueIdProvider";
import { random } from "../Utils";
import { Config } from "../config";
import type { Viewport } from "@/Graphics/Viewport";
import {
    applyTwinkle,
    colorToRgba,
    generateStarColor,
    generateStarTwinkle,
    generateStarType,
    StarType
} from "./CosmosStars";

const SEGMENT_SIZE = 200;
const MAX_Z = 2;
const RARE_STAR_CHANCE_DENOMINATOR = 1000;
const RARE_STAR_CHANCE = 1 / RARE_STAR_CHANCE_DENOMINATOR;
const RARE_STAR_HALO_ALPHA_MULTIPLIER = 0.4;
const RARE_STAR_HALO_SIZE_MULTIPLIER = 2.4;
const RARE_STAR_CORE_ALPHA_BOOST = 0.2;
const RARE_STAR_CORE_SIZE_MULTIPLIER = 0.45;
const RARE_STAR_SIZE_MIN = 3.5;
const RARE_STAR_SIZE_MAX = 5.5;
const RARE_STAR_OPACITY_MULTIPLIER = 1.25;

interface IStar {
    pos: Vector;
    z: number;
    size: number;
    opacity: number;
    type: StarType;
    color: ReturnType<typeof generateStarColor>;
    twinkle: ReturnType<typeof generateStarTwinkle>;
}

interface IStarSegment {
    stars: IStar[];
}

const config = Config.cosmos;

class Cosmos implements IDrawable {
    public id: number = UniqueIdProvider.next();
    public starSegments: Record<string, IStarSegment> = {};

    private readonly _alive = true;

    public get alive() {
        return this._alive;
    }

    public draw(viewport: Viewport) {
        const
            bottomLeft = viewport.toWorldCoordinates(new Vector(0, viewport.height)),
            topRight = viewport.toWorldCoordinates(new Vector(viewport.width, 0));

        const
            bottomLeftSegment = bottomLeft.div(SEGMENT_SIZE).floor().sub(Vector.One),
            topRightSegment = topRight.div(SEGMENT_SIZE).ceil().add(Vector.One);

        const { ctx } = viewport;
        const time = Date.now() / 1000;

        ctx.save();

        for (let x = bottomLeftSegment.x; x <= topRightSegment.x; x++) {
            for (let y = bottomLeftSegment.y; y <= topRightSegment.y; y++) {
                this.forSegment(x, y, star => {
                    const p = viewport.toScreenCoordinates(star.pos).div(star.z);

                    const alpha = applyTwinkle(
                        star.twinkle,
                        star.opacity / star.z,
                        time
                    );

                    if (star.type === StarType.Rare) {
                        ctx.fillStyle = colorToRgba(
                            star.color,
                            alpha * RARE_STAR_HALO_ALPHA_MULTIPLIER
                        );
                        ctx.beginPath();
                        ctx.arc(
                            p.x,
                            p.y,
                            star.size * RARE_STAR_HALO_SIZE_MULTIPLIER,
                            0,
                            2 * Math.PI
                        );
                        ctx.fill();
                    }

                    ctx.fillStyle = colorToRgba(star.color, alpha);
                    ctx.beginPath();
                    ctx.arc(p.x, p.y, star.size, 0, 2 * Math.PI);
                    ctx.fill();

                    if (star.type === StarType.Rare) {
                        ctx.fillStyle = `rgba(255, 255, 255, ${
                            Math.min(1, alpha + RARE_STAR_CORE_ALPHA_BOOST)
                        })`;
                        ctx.beginPath();
                        ctx.arc(
                            p.x,
                            p.y,
                            star.size * RARE_STAR_CORE_SIZE_MULTIPLIER,
                            0,
                            2 * Math.PI
                        );
                        ctx.fill();
                    }
                });
            }
        }

        ctx.restore();
    }

    private forSegment(x: number, y: number, action: (star: IStar) => void) {
        const segment = this.getSegment(x, y);
        for (const star of segment.stars) {
            action(star);
        }
    }

    private getSegment(x: number, y: number): IStarSegment {
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

function generateStars(x: number, y: number): IStar[] {
    const stars: IStar[] = [];

    const origin = new Vector(x, y).mul(SEGMENT_SIZE);
    const starsPerSegment = SEGMENT_SIZE * SEGMENT_SIZE / (1000 * 1000) * config.starDensity;

    for (let i = 0; i < starsPerSegment; i++) {
        const type = generateStarType(RARE_STAR_CHANCE);

        stars.push({
            pos: origin.add(new Vector(
                Math.random(),
                Math.random()
            ).mul(SEGMENT_SIZE * MAX_Z)),
            z: random(1, MAX_Z),
            size: type === StarType.Rare
                ? random(RARE_STAR_SIZE_MIN, RARE_STAR_SIZE_MAX)
                : 1 + Math.random() * 2,
            opacity: type === StarType.Rare
                ? Math.min(
                    1,
                    random(config.starBrightnessMin, config.starBrightnessMax)
                    * RARE_STAR_OPACITY_MULTIPLIER
                )
                : random(config.starBrightnessMin, config.starBrightnessMax),
            type,
            color: generateStarColor(config.starTints),
            twinkle: generateStarTwinkle(type, config.twinkle)
        });
    }

    return stars;
}

export default Cosmos;
