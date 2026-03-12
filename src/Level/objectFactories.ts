import { Beacon } from "@/Beacon";
import Fuel from "@/Fuel";
import { GravityWell } from "@/GravityWell";
import Meteor from "@/Meteor";
import type Body from "@/Physics/Body";
import Vector from "@/Physics/Vector";
import type RNG from "@/RNG";
import type { GameObject } from "./types";

export const FUEL_DEFAULT_ANGULAR_VELOCITY = 0.21;

export function createFuelFromObject(o: GameObject): Fuel {
    const fuel = new Fuel(getPosition(o));

    if (o.props?.amount != undefined) {
        fuel.amount = getNumericValue(
            o.props.amount,
            `Fuel '${o.id}' requires props.amount to be a number.`
        );
    }

    applyBodyKinematics(fuel, o);

    if (o.angularVelocity == undefined) {
        fuel.angularVelocity = FUEL_DEFAULT_ANGULAR_VELOCITY;
    }

    return fuel;
}

export function createBeaconFromObject(o: GameObject): Beacon {
    const beacon = new Beacon(getPosition(o));

    if (o.props?.active !== undefined) {
        beacon.active = getBooleanValue(
            o.props.active,
            `Beacon '${o.id}' requires props.active to be a boolean.`
        );
    }

    applyBodyKinematics(beacon, o);

    return beacon;
}

export function createGravityWellFromObject(o: GameObject): GravityWell {
    const range = getRequiredNumericProp(
        o,
        "range",
        `Gravity well '${o.id}' requires props.range.`
    );
    const strength = getRequiredNumericProp(
        o,
        "strength",
        `Gravity well '${o.id}' requires props.strength.`
    );

    const gravityWell = new GravityWell(getPosition(o), range, strength);
    applyBodyKinematics(gravityWell, o);
    return gravityWell;
}

export function createMeteorFromObject(o: GameObject, rng: RNG): Meteor {
    const diameter = getRequiredNumericProp(
        o,
        "diameter",
        `Meteor '${o.id}' requires props.diameter.`
    );
    const mass = getRequiredNumericProp(
        o,
        "mass",
        `Meteor '${o.id}' requires props.mass.`
    );
    const cornerCount = getOptionalCornerCount(o);
    const strength = getOptionalPositiveNumber(
        o,
        "strength",
        `Meteor '${o.id}' requires props.strength to be > 0.`
    );

    if (diameter <= 0) {
        throw new Error(`Meteor '${o.id}' requires props.diameter to be > 0.`);
    }

    if (mass <= 0) {
        throw new Error(`Meteor '${o.id}' requires props.mass to be > 0.`);
    }

    return new Meteor(getPosition(o), {
        diameter,
        mass,
        velocity: getVelocity(o),
        angularVelocity: getAngularVelocity(o),
        cornerCount,
        strength
    }, rng);
}

function getRequiredNumericProp(o: GameObject, key: string, message: string): number {
    const value = o.props?.[key];

    if (value == undefined) {
        throw new Error(message);
    }

    return getNumericValue(value, message);
}

function getNumericValue(value: unknown, message: string): number {
    if (typeof value !== "number" || !Number.isFinite(value)) {
        throw new Error(message);
    }

    return value;
}

function getBooleanValue(value: unknown, message: string): boolean {
    if (typeof value !== "boolean") {
        throw new Error(message);
    }

    return value;
}

function getPosition(o: GameObject): Vector {
    return getVector(
        o.position,
        `Object '${o.id}' requires position as [x, y] finite numbers.`
    );
}

function getVector(value: unknown, message: string): Vector {
    const [x, y] = getVectorComponents(value, message);
    return new Vector(x, y);
}

function getVectorComponents(value: unknown, message: string): [number, number] {
    if (!Array.isArray(value) || value.length < 2) {
        throw new Error(message);
    }

    const x = getNumericValue(value[0], message);
    const y = getNumericValue(value[1], message);

    return [x, y];
}

function getOptionalCornerCount(o: GameObject): number | undefined {
    const value = o.props?.cornerCount;

    if (value == undefined) return undefined;

    const minCornerCount = 3;

    if (!isValidCornerCount(value, minCornerCount)) {
        throw new Error(
            `Meteor '${o.id}' requires props.cornerCount to be an integer >= ${minCornerCount}.`
        );
    }

    return value;
}

function isValidCornerCount(value: unknown, minCornerCount: number): value is number {
    return typeof value === "number"
        && Number.isInteger(value)
        && value >= minCornerCount;
}

function getOptionalPositiveNumber(
    o: GameObject,
    key: string,
    message: string
): number | undefined {
    const value = o.props?.[key];

    if (value == undefined) {
        return undefined;
    }

    const numberValue = getNumericValue(value, message);

    if (numberValue <= 0) {
        throw new Error(message);
    }

    return numberValue;
}

function applyBodyKinematics(body: Body, o: GameObject): void {
    const velocity = getVelocity(o);

    if (velocity) {
        body.v = velocity;
    }

    const angularVelocity = getAngularVelocity(o);
    if (angularVelocity != undefined) {
        body.angularVelocity = angularVelocity;
    }
}

function getVelocity(o: GameObject): Vector | undefined {
    if (!o.velocity) {
        return undefined;
    }

    return getVector(
        o.velocity,
        `Object '${o.id}' requires velocity as [vx, vy] finite numbers.`
    );
}

function getAngularVelocity(o: GameObject): number | undefined {
    if (o.angularVelocity == undefined) {
        return undefined;
    }

    return getNumericValue(
        o.angularVelocity,
        `Object '${o.id}' requires angularVelocity to be a finite number.`
    );
}

