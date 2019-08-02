import Polygon from "./Polygon";
import Vector from "../Physics/Vector";

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
    Ship: Polygon.Make([
         0,  2,
        +1, -1,
        -1, -1
    ]),
    
    Ammo: Polygon.Make([
        0,  2,
       +1, -1,
       -1, -1
    ]),

    Capsule: makeCapsule(8, 4)
}

function makeCapsule(width: number, height: number) {
    const hw = width / 2, hh = height / 2, seg = height / 4;

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
