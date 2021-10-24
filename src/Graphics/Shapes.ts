import Polygon from "./Polygon";
import Vector from "../Physics/Vector";

const FUEL_CAPSULE_WIDTH = 8;
const FUEL_CAPSULE_HEIGHT = 4;

class PolygonMaker {
    pts: Vector[] = [];

    get last(): Vector {
        return this.pts[this.pts.length - 1];
    }

    abs(x: number, y: number) {
        this.pts.push(new Vector(x, y));
    }

    rel(x: number, y: number) {
        this.abs(this.last.x + x, this.last.y + y);
    }

    getPolygon(): Polygon {
        return new Polygon(this.pts);
    }
}

export default {
    Ship: Polygon.make([
        0,  2,
        +1, -1,
        -1, -1
    ]),

    Ammo: Polygon.make([
        0,  2,
        +1, -1,
        -1, -1
    ]),

    Capsule: makeCapsule(FUEL_CAPSULE_WIDTH, FUEL_CAPSULE_HEIGHT)
};

function makeCapsule(width: number, height: number) {
    /* TODO: Rewrite this function. It does not function properly nor it does
     * make any sense. The width and the height of the generated capsule are
     * somehow wrong. */

    // eslint-disable-next-line no-magic-numbers
    const hw = width / 2, seg = height / 4;

    const pm = new PolygonMaker();

    pm.abs(-hw, seg / 2);
    pm.rel(seg, 0);
    pm.rel(0, seg);
    pm.rel(width - seg * 2, 0);
    pm.rel(0, -seg);
    pm.rel(seg, 0);
    pm.rel(0, -seg);
    pm.rel(-seg, 0);
    pm.rel(0, -seg);
    pm.rel(-width + seg * 2, 0);
    pm.rel(0, seg);
    pm.rel(-seg, 0);

    return pm.getPolygon();
}
