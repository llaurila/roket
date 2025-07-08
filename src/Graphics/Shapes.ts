/* eslint-disable no-magic-numbers */

import Polygon from "./Polygon";
import Vector from "../Physics/Vector";

const SQRT3 = Math.sqrt(3);

export default {
    Ship: Polygon.make([
        0,  2,
        +1, -1,
        -1, -1
    ]),

    Triangle: Polygon.make([
        -1, SQRT3,
        2, 0,
        -1, -SQRT3
    ]),

    Capsule: makeCapsule(1, 0.5)
};

function makeCapsule(width: number, height: number) {
    const radius = height / 2;
    const bodyLength = Math.max(0, width - height);
    const halfRect = bodyLength / 2;

    // How many segments to use for each semi-circle
    const SEGMENTS = 8;
    const points: Vector[] = [];

    // Right cap
    for (let i = 0; i <= SEGMENTS; i++) {
        const theta = Math.PI / 2 - (i * Math.PI) / SEGMENTS;
        points.push(new Vector(
            halfRect + radius * Math.cos(theta),
            radius * Math.sin(theta)
        ));
    }

    // Left cap
    for (let i = 0; i <= SEGMENTS; i++) {
        const theta = -Math.PI / 2 - (i * Math.PI) / SEGMENTS;
        points.push(new Vector(
            -halfRect + radius * Math.cos(theta),
            radius * Math.sin(theta)
        ));
    }

    return new Polygon(points);
}
