/* eslint-disable no-magic-numbers */

import Polygon from "./Polygon";
import Vector from "../Physics/Vector";

const SQRT3 = Math.sqrt(3);

class PolygonMaker {
    public pts: Vector[] = [];

    public get last(): Vector {
        return this.pts[this.pts.length - 1];
    }

    public abs(x: number, y: number) {
        this.pts.push(new Vector(x, y));
    }

    public rel(x: number, y: number) {
        this.abs(this.last.x + x, this.last.y + y);
    }

    public getPolygon(): Polygon {
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

    /*Triangle: Polygon.make([
        0, -2,
        SQRT3, 1,
        -SQRT3, 1
    ]),*/

    Triangle: Polygon.make([
        -1, SQRT3,
        2, 0,
        -1, -SQRT3
    ]),

    Capsule: makeCapsule(1, 0.5)
};

function makeCapsule(width: number, height: number) {
    /* TODO: Rewrite this function. It does not function properly nor it does
     * make any sense. The width and the height of the generated capsule are
     * somehow wrong. */


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
