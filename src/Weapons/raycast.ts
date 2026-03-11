import Fuel from "@/Fuel";
import Meteor from "@/Meteor";
import type PhysicsEngine from "@/Physics/PhysicsEngine";
import type Vector from "@/Physics/Vector";

export interface ICircleRaycastHit {
    body: LaserTarget;
    point: Vector;
    distance: number;
}

export type LaserTarget = Meteor | Fuel;

const EPSILON = 0.000001;

export function raycastMeteors(
    physics: PhysicsEngine,
    origin: Vector,
    direction: Vector,
    maxDistance: number
): ICircleRaycastHit | null {
    const targets = physics.filter((obj): obj is LaserTarget =>
        (obj instanceof Meteor || obj instanceof Fuel) && obj.alive
    );

    let nearest: ICircleRaycastHit | null = null;

    for (const target of targets) {
        const radius = target.circleCollider.radius;
        const hitDistance = intersectRayWithCircle(
            origin,
            direction,
            target.pos,
            radius,
            maxDistance
        );

        if (hitDistance == null) {
            continue;
        }

        nearest = pickNearestHit(nearest, target, origin, direction, hitDistance);
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
    target: LaserTarget,
    origin: Vector,
    direction: Vector,
    hitDistance: number
): ICircleRaycastHit {
    if (!current || hitDistance < current.distance) {
        return {
            body: target,
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
