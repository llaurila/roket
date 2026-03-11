import { Config } from "@/config";
import Meteor from "@/Meteor";
import Ship from "@/Ship";
import Body from "./Body";
import type IUpdatable from "./IUpdatable";
import Vector from "./Vector";

const EPSILON = 0.000001;
const MAX_ALLOWED_OVERLAP = 0.25;

interface ICollisionState {
    a: Body;
    b: Body;
    relativeVelocity: Vector;
    normal: Vector;
    overlap: number;
    closingSpeed: number;
}

interface IShipCollisionContext {
    shipA: Ship;
    shipB: Ship;
    shipAHasShield: boolean;
    shipBHasShield: boolean;
}

export class PhysicsEngineUpdater {
    private time: number;
    private delta: number;
    private objects: IUpdatable[];

    public constructor(time: number, delta: number, objects: IUpdatable[]) {
        this.time = time;
        this.delta = delta;
        this.objects = objects;
    }

    public update(): void {
        this.updateObjects();
        this.checkForCollisions();
    }

    private updateObjects(): void {
        for (const obj of this.objects) {
            if (obj.alive) {
                obj.update(this.time, this.delta);
            }
        }
    }

    private checkForCollisions(): void {
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

function checkBodyForCollision(a: Body, b: Body): void {
    const collision = getCollisionState(a, b);
    if (!collision) {
        return;
    }

    resolveCollision(collision);

    a.signalCollision(b);
    b.signalCollision(a);
}

function getCollisionState(a: Body, b: Body): ICollisionState | null {
    const radiusA = getCollisionRadius(a, b);
    const radiusB = getCollisionRadius(b, a);

    if (!isCollisionOverlap(a, b, radiusA, radiusB)) {
        return null;
    }

    const delta = b.pos.sub(a.pos);
    const distance = delta.length();
    const relativeVelocity = b.v.sub(a.v);
    const normal = getCollisionNormal(delta, distance, relativeVelocity);

    return {
        a,
        b,
        relativeVelocity,
        normal,
        overlap: radiusA + radiusB - distance,
        closingSpeed: getClosingSpeed(relativeVelocity, normal)
    };
}

function getCollisionRadius(body: Body, other: Body): number {
    if (isShieldImpactBody(body, other)) {
        return (body as Ship).getShieldCollisionRadius();
    }

    return body.circleCollider?.radius ?? 0;
}

function isShieldImpactBody(body: Body, other: Body): boolean {
    if (!(body instanceof Ship) || !body.hasShield()) {
        return false;
    }

    return other instanceof Ship || other instanceof Meteor;
}

function isCollisionOverlap(a: Body, b: Body, radiusA: number, radiusB: number): boolean {
    if (radiusA <= 0 || radiusB <= 0) {
        return false;
    }

    return a.pos.sub(b.pos).length() < radiusA + radiusB;
}

function getClosingSpeed(relativeVelocity: Vector, normal: Vector): number {
    return Math.max(0, -relativeVelocity.dot(normal));
}

function resolveCollision(collision: ICollisionState): void {
    if (isMeteorMeteorCollision(collision)) {
        resolveBounceCollision(collision, Config.meteor.collisionRestitution);
        return;
    }

    if (isShipMeteorCollision(collision)) {
        resolveShipMeteorCollision(collision);
        return;
    }

    if (isShipShipCollision(collision)) {
        resolveShipShipCollision(collision);
    }
}

function resolveShipMeteorCollision(collision: ICollisionState): void {
    const ship = getShipFromCollision(collision);
    if (!ship) {
        return;
    }

    if (!ship.hasShield()) {
        ship.die();
        return;
    }

    resolveBounceCollision(collision, Config.ship.shield.collisionRestitution);
    ship.absorbShieldImpact(collision.closingSpeed);
}

function resolveShipShipCollision(collision: ICollisionState): void {
    const context = getShipCollisionContext(collision);
    if (!context) {
        return;
    }

    if (!shouldResolveShipShipImpact(context)) {
        return;
    }

    resolveBounceCollision(collision, Config.ship.shield.collisionRestitution);
    absorbShipShieldImpact(context, collision.closingSpeed);
    destroyUnshieldedShip(context);
}

function getShipCollisionContext(collision: ICollisionState): IShipCollisionContext | null {
    const ships = getShipsFromCollision(collision);
    if (!ships) {
        return null;
    }

    const [shipA, shipB] = ships;

    return {
        shipA,
        shipB,
        shipAHasShield: shipA.hasShield(),
        shipBHasShield: shipB.hasShield()
    };
}

function shouldResolveShipShipImpact(context: IShipCollisionContext): boolean {
    return context.shipAHasShield || context.shipBHasShield;
}

function absorbShipShieldImpact(context: IShipCollisionContext, closingSpeed: number): void {
    if (context.shipAHasShield) {
        context.shipA.absorbShieldImpact(closingSpeed);
    }

    if (context.shipBHasShield) {
        context.shipB.absorbShieldImpact(closingSpeed);
    }
}

function destroyUnshieldedShip(context: IShipCollisionContext): void {
    if (context.shipAHasShield && !context.shipBHasShield) {
        context.shipB.die();
    }

    if (context.shipBHasShield && !context.shipAHasShield) {
        context.shipA.die();
    }
}

function resolveBounceCollision(collision: ICollisionState, restitution: number): void {
    if (!isResolvableOverlap(collision.overlap)) {
        return;
    }

    const invMassA = getInverseMass(collision.a);
    const invMassB = getInverseMass(collision.b);
    const invMassTotal = invMassA + invMassB;

    if (invMassTotal <= 0) {
        return;
    }

    correctOverlap(collision, invMassA, invMassB, invMassTotal);
    applyImpulse(collision, restitution, invMassA, invMassB, invMassTotal);
}

function getInverseMass(body: Body): number {
    const mass = body.getMass();

    if (mass <= EPSILON) {
        return 0;
    }

    return 1 / mass;
}

function isResolvableOverlap(overlap: number): boolean {
    return overlap > 0 && overlap <= MAX_ALLOWED_OVERLAP;
}

function correctOverlap(
    collision: ICollisionState,
    invMassA: number,
    invMassB: number,
    invMassTotal: number
): void {
    const correction = collision.normal.mul(collision.overlap / invMassTotal);

    collision.a.pos = collision.a.pos.sub(correction.mul(invMassA));
    collision.b.pos = collision.b.pos.add(correction.mul(invMassB));
}

function applyImpulse(
    collision: ICollisionState,
    restitution: number,
    invMassA: number,
    invMassB: number,
    invMassTotal: number
): void {
    const velocityAlongNormal = collision.relativeVelocity.dot(collision.normal);

    if (velocityAlongNormal > 0) {
        return;
    }

    const impulseMagnitude =
        -(1 + restitution) * velocityAlongNormal /
        invMassTotal;
    const impulse = collision.normal.mul(impulseMagnitude);

    collision.a.v = collision.a.v.sub(impulse.mul(invMassA));
    collision.b.v = collision.b.v.add(impulse.mul(invMassB));
}

function isMeteorMeteorCollision(collision: ICollisionState): boolean {
    return collision.a instanceof Meteor && collision.b instanceof Meteor;
}

function isShipMeteorCollision(collision: ICollisionState): boolean {
    return isBodyPair(collision, Ship, Meteor);
}

function isShipShipCollision(collision: ICollisionState): boolean {
    return collision.a instanceof Ship && collision.b instanceof Ship;
}

function getShipFromCollision(collision: ICollisionState): Ship | null {
    if (collision.a instanceof Ship) {
        return collision.a;
    }

    if (collision.b instanceof Ship) {
        return collision.b;
    }

    return null;
}

function getShipsFromCollision(collision: ICollisionState): [Ship, Ship] | null {
    if (collision.a instanceof Ship && collision.b instanceof Ship) {
        return [collision.a, collision.b];
    }

    return null;
}

function isBodyPair<TA extends Body, TB extends Body>(
    collision: ICollisionState,
    aType: new (...args: never[]) => TA,
    bType: new (...args: never[]) => TB
): boolean {
    return isBodyPairByInstance(collision.a, collision.b, aType, bType);
}

function isBodyPairByInstance<TA extends Body, TB extends Body>(
    a: Body,
    b: Body,
    aType: new (...args: never[]) => TA,
    bType: new (...args: never[]) => TB
): boolean {
    return (a instanceof aType && b instanceof bType) ||
        (a instanceof bType && b instanceof aType);
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
