import Fuel from "@/Fuel";
import Vector from "@/Physics/Vector";
import { Beacon } from "@/Beacon";
import { GravityWell } from "@/GravityWell";
import type { GameObject } from "./types";

export const FUEL_DEFAULT_ANGULAR_VELOCITY = 0.21;

export function createFuelFromObject(o: GameObject): Fuel {
    const fuel = new Fuel(Vector.fromComponents(o.position));

    if (o.props?.amount) {
        fuel.amount = o.props.amount as number;
    }

    fuel.angularVelocity = o.angularVelocity || FUEL_DEFAULT_ANGULAR_VELOCITY;
    return fuel;
}

export function createBeaconFromObject(o: GameObject): Beacon {
    const beacon = new Beacon(Vector.fromComponents(o.position));

    if (o.props?.active !== undefined) {
        beacon.active = o.props.active as boolean;
    }

    return beacon;
}

export function createGravityWellFromObject(o: GameObject): GravityWell {
    const range = getRequiredNumericProp(o, "range");
    const strength = getRequiredNumericProp(o, "strength");

    return new GravityWell(Vector.fromComponents(o.position), range, strength);
}

function getRequiredNumericProp(o: GameObject, key: "range" | "strength"): number {
    const value = o.props?.[key] as number | undefined;

    if (value == undefined) {
        throw new Error(`Gravity well '${o.id}' requires props.range and props.strength.`);
    }

    return value;
}