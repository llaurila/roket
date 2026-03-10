import Meteor from "@/Meteor";
import type PhysicsEngine from "@/Physics/PhysicsEngine";
import type Vector from "@/Physics/Vector";

export interface ICircleRaycastHit {
    body: Meteor;
    point: Vector;
    distance: number;
}

const EPSILON = 0.000001;

export function raycastMeteors(
    physics: PhysicsEngine,
    origin: Vector,
    direction: Vector,
    maxDistance: number
): ICircleRaycastHit | null {
    const meteors = physics.filter((obj): obj is Meteor =>
        obj instanceof Meteor &&
        obj.alive
    );

    let nearest: ICircleRaycastHit | null = null;

    for (const meteor of meteors) {
        const radius = meteor.circleCollider.radius;
        const hitDistance = intersectRayWithCircle(
            origin,
            direction,
            meteor.pos,
            radius,
            maxDistance
        );

        if (hitDistance == null) {
            continue;
        }

        nearest = pickNearestHit(nearest, meteor, origin, direction, hitDistance);
    }

    return nearest;
}

function intersectRayWithCircle(
    origin: Vector,
    direction: Vector,
    center: Vector,
    radius: number,
    maxDistance: number
): number | null {
    const offset = origin.sub(center);
    const b = offset.dot(direction);
    const c = offset.dot(offset) - radius * radius;
    const discriminant = b * b - c;

    if (discriminant < 0) {
        return null;
    }

    const sqrtDiscriminant = Math.sqrt(discriminant);
    const near = -b - sqrtDiscriminant;
    const far = -b + sqrtDiscriminant;

    const hitDistance = getPositiveDistance(near, far);

    if (hitDistance == null || hitDistance > maxDistance) {
        return null;
    }

    return hitDistance;
}

function pickNearestHit(
    current: ICircleRaycastHit | null,
    meteor: Meteor,
    origin: Vector,
    direction: Vector,
    hitDistance: number
): ICircleRaycastHit {
    if (!current || hitDistance < current.distance) {
        return {
            body: meteor,
            distance: hitDistance,
            point: origin.add(direction.mul(hitDistance))
        };
    }

    return current;
}

function getPositiveDistance(near: number, far: number): number | null {
    if (near > EPSILON) {
        return near;
    }

    if (far > EPSILON) {
        return far;
    }

    return null;
}
