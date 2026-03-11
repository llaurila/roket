import { Config } from "@/config";
import Meteor from "@/Meteor";
import Body from "./Body";
import CircleCollider from "./CircleCollider";
import type IUpdatable from "./IUpdatable";
import Vector from "./Vector";

const EPSILON = 0.000001;
const MAX_ALLOWED_OVERLAP = 0.25;

export class PhysicsEngineUpdater {
    private time: number;
    private delta: number;
    private objects: IUpdatable[];

    public constructor(time: number, delta: number, objects: IUpdatable[]) {
        this.time = time;
        this.delta = delta;
        this.objects = objects;
    }

    public update() {
        this.updateObjects();
        this.checkForCollisions();
    }

    private updateObjects() {
        for (const obj of this.objects) {
            if (obj.alive) {
                obj.update(this.time, this.delta);
            }
        }
    }

    private checkForCollisions() {
        const bodies = this.objects.filter(
            (obj): obj is Body => obj instanceof Body && obj.alive
        );

        for (let i = 0; i < bodies.length; i++) {
            this.checkBodyCollisions(bodies, i);
        }
    }

    private checkBodyCollisions(bodies: Body[], index: number): void {
        const obj = bodies[index];

        if (shouldStopCollisionChecks(obj)) {
            return;
        }

        const remainingBodies = bodies.slice(index + 1).filter(isCollidableBody);

        for (const b of remainingBodies) {
            if (shouldStopCollisionChecks(obj)) {
                break;
            }

            checkBodyForCollision(obj, b);
        }
    }
}

function isCollidableBody(body: Body): boolean {
    return body.alive;
}

function shouldStopCollisionChecks(body: Body): boolean {
    return !isCollidableBody(body);
}

function checkBodyForCollision(obj: Body, b: Body) {
    if (!CircleCollider.check(obj, b)) {
        return;
    }

    resolveCollision(obj, b);

    obj.signalCollision(b);
    b.signalCollision(obj);
}

function resolveCollision(a: Body, b: Body): void {
    if (a instanceof Meteor && b instanceof Meteor) {
        resolveMeteorCollision(a, b);
    }
}

function resolveMeteorCollision(a: Meteor, b: Meteor): void {
    const collisionRadii = getCollisionRadii(a, b);
    const delta = b.pos.sub(a.pos);
    const distance = delta.length();
    const minDistance = collisionRadii.radiusA + collisionRadii.radiusB;
    const overlap = minDistance - distance;

    if (!isResolvableOverlap(overlap)) {
        return;
    }

    const normal = getCollisionNormal(delta, distance, b.v.sub(a.v));
    const invMassA = 1 / a.getMass();
    const invMassB = 1 / b.getMass();
    const invMassTotal = invMassA + invMassB;

    if (invMassTotal <= 0) {
        return;
    }

    correctOverlap(a, b, normal, overlap, invMassA, invMassB, invMassTotal);
    applyImpulse(a, b, normal, invMassA, invMassB, invMassTotal);
}

function getCollisionRadii(a: Meteor, b: Meteor): { radiusA: number; radiusB: number } {
    return {
        radiusA: a.circleCollider.radius,
        radiusB: b.circleCollider.radius
    };
}

function isResolvableOverlap(overlap: number): boolean {
    return overlap > 0 && overlap <= MAX_ALLOWED_OVERLAP;
}

function correctOverlap(
    a: Meteor,
    b: Meteor,
    normal: Vector,
    overlap: number,
    invMassA: number,
    invMassB: number,
    invMassTotal: number
): void {
    const correction = normal.mul(overlap / invMassTotal);

    a.pos = a.pos.sub(correction.mul(invMassA));
    b.pos = b.pos.add(correction.mul(invMassB));
}

function applyImpulse(
    a: Meteor,
    b: Meteor,
    normal: Vector,
    invMassA: number,
    invMassB: number,
    invMassTotal: number
): void {
    const relativeVelocity = b.v.sub(a.v);
    const velocityAlongNormal = relativeVelocity.dot(normal);

    if (velocityAlongNormal > 0) {
        return;
    }

    const impulseMagnitude =
        -(1 + Config.meteor.collisionRestitution) * velocityAlongNormal /
        invMassTotal;
    const impulse = normal.mul(impulseMagnitude);

    a.v = a.v.sub(impulse.mul(invMassA));
    b.v = b.v.add(impulse.mul(invMassB));
}

function getCollisionNormal(delta: Vector, distance: number, relativeVelocity: Vector): Vector {
    if (distance > EPSILON) {
        return delta.div(distance);
    }

    const relativeSpeed = relativeVelocity.length();

    if (relativeSpeed > EPSILON) {
        return relativeVelocity.div(relativeSpeed);
    }

    return Vector.UnitX;
}
