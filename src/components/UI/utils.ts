import type Vector from "@/Physics/Vector";
import type Body from "@/Physics/Body";
import { radToDeg } from "@/Utils";

export function getBearing(body: Body, target: Vector): string {
    const FULL_CIRCLE = 360;

    const v1 = target.sub(body.pos).normalize();
    const v2 = body.v.normalize();

    const dot = v1.dot(v2);
    const det  = v1.cross(v2);

    let angle = radToDeg(Math.atan2(det, dot));

    if (Number.isNaN(angle)) {
        angle = 0;
    }
    else if (angle < 0) {
        angle += FULL_CIRCLE;
    }

    const DIGITS = 3;

    return Math.floor(angle).toFixed().padStart(DIGITS, "0");
}
