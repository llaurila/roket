import { Beacon } from "@/Beacon";
import Fuel from "@/Fuel";
import { GravityWell } from "@/GravityWell";
import Meteor from "@/Meteor";
import type Body from "@/Physics/Body";
import Vector from "@/Physics/Vector";
import RNG from "@/RNG";
import type { GameObject } from "./types";

export const FUEL_DEFAULT_ANGULAR_VELOCITY = 0.21;

export function createFuelFromObject(o: GameObject): Fuel {
    const fuel = new Fuel(Vector.fromComponents(o.position));

    if (o.props?.amount != undefined) {
        fuel.amount = getNumericValue(o.props.amount, `Fuel '${o.id}' requires props.amount to be a number.`);
    }

    applyBodyKinematics(fuel, o);

    if (o.angularVelocity == undefined) {
        fuel.angularVelocity = FUEL_DEFAULT_ANGULAR_VELOCITY;
    }

    return fuel;
}

export function createBeaconFromObject(o: GameObject): Beacon {
    const beacon = new Beacon(Vector.fromComponents(o.position));

    if (o.props?.active !== undefined) {
        beacon.active = o.props.active as boolean;
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

    const gravityWell = new GravityWell(Vector.fromComponents(o.position), range, strength);
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

    if (diameter <= 0) {
        throw new Error(`Meteor '${o.id}' requires props.diameter to be > 0.`);
    }

    if (mass <= 0) {
        throw new Error(`Meteor '${o.id}' requires props.mass to be > 0.`);
    }

    return new Meteor(Vector.fromComponents(o.position), {
        diameter,
        mass,
        velocity: getVelocity(o),
        angularVelocity: o.angularVelocity,
        cornerCount
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
    if (typeof value !== "number" || Number.isNaN(value)) {
        throw new Error(message);
    }

    return value;
}

function getOptionalCornerCount(o: GameObject): number | undefined {
    const value = o.props?.cornerCount;

    if (value == undefined) {
        return undefined;
    }

    if (typeof value !== "number" || !Number.isInteger(value) || value < 3) {
        throw new Error(`Meteor '${o.id}' requires props.cornerCount to be an integer >= 3.`);
    }

    return value;
}

function applyBodyKinematics(body: Body, o: GameObject): void {
    const velocity = getVelocity(o);

    if (velocity) {
        body.v = velocity;
    }

    if (o.angularVelocity != undefined) {
        body.angularVelocity = o.angularVelocity;
    }
}

function getVelocity(o: GameObject): Vector | undefined {
    if (!o.velocity) {
        return undefined;
    }

    return Vector.fromComponents(o.velocity);
}

