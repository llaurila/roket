/* eslint-disable no-magic-numbers */
import { expect, test } from "vitest";
import {
    createBeaconFromObject,
    createFuelFromObject,
    createGravityWellFromObject,
    createLightningMineFromObject,
    createMeteorFromObject
} from "@/Level/objectFactories";
import type { GameObject } from "@/Level/types";
import RNG from "@/RNG";

function createBaseObject(type: string): GameObject {
    return {
        id: `${type}-object`,
        type,
        position: [0, 0]
    };
}

test("factory accepts valid finite kinematic inputs", () => {
    const fuelObject: GameObject = {
        ...createBaseObject("fuel"),
        position: [10, -20],
        velocity: [3, -4],
        angularVelocity: 0.5
    };

    const fuel = createFuelFromObject(fuelObject);

    expect(fuel.pos.x).toBe(10);
    expect(fuel.pos.y).toBe(-20);
    expect(fuel.v.x).toBe(3);
    expect(fuel.v.y).toBe(-4);
    expect(fuel.angularVelocity).toBe(0.5);
});

test("factory rejects non-finite position values", () => {
    const object = {
        ...createBaseObject("fuel"),
        position: [Infinity, 0]
    } as unknown as GameObject;

    expect(() => createFuelFromObject(object)).toThrow(/position/);
});

test("factory rejects malformed velocity vectors", () => {
    const object = {
        ...createBaseObject("fuel"),
        velocity: [1]
    } as unknown as GameObject;

    expect(() => createFuelFromObject(object)).toThrow(/velocity/);
});

test("factory rejects non-finite angularVelocity", () => {
    const object = {
        ...createBaseObject("fuel"),
        angularVelocity: Number.NaN
    } as unknown as GameObject;

    expect(() => createFuelFromObject(object)).toThrow(/angularVelocity/);
});

test("beacon factory requires props.active to be a boolean", () => {
    const object = {
        ...createBaseObject("beacon"),
        props: {
            active: "yes"
        }
    } as unknown as GameObject;

    expect(() => createBeaconFromObject(object)).toThrow(/props\.active/);
});

test("gravity well factory rejects non-finite range", () => {
    const object = {
        ...createBaseObject("gravity-well"),
        props: {
            range: Infinity,
            strength: 1
        }
    } as unknown as GameObject;

    expect(() => createGravityWellFromObject(object)).toThrow(/props\.range/);
});

test("meteor factory rejects non-finite mass", () => {
    const object = {
        ...createBaseObject("meteor"),
        props: {
            diameter: 10,
            mass: Number.NaN
        }
    } as unknown as GameObject;

    expect(() => createMeteorFromObject(object, new RNG(1))).toThrow(/props\.mass/);
});

test("lightning mine factory validates range and applies optional overrides", () => {
    const object: GameObject = {
        ...createBaseObject("lightning-mine"),
        props: {
            range: 26,
            pulseInterval: 1.1,
            shieldDrainPerPulse: 0.2,
            idleColor: { R: 0.2, G: 0.7, B: 1, A: 0.8 }
        }
    };

    const mine = createLightningMineFromObject(object);

    expect(mine.pos.x).toBe(0);
    expect(mine.pos.y).toBe(0);
    expect(mine.getPulseState()).toBeDefined();

    expect(() => createLightningMineFromObject({
        ...createBaseObject("lightning-mine"),
        props: {
            pulseInterval: 1.2
        }
    })).toThrow(/props\.range/);

    expect(() => createLightningMineFromObject({
        ...createBaseObject("lightning-mine"),
        props: {
            range: -1
        }
    })).toThrow(/props\.range to be > 0/);

    expect(() => createLightningMineFromObject({
        ...createBaseObject("lightning-mine"),
        props: {
            range: 20,
            idleColor: { R: 1, G: 1, B: 1 }
        }
    })).toThrow(/props\.idleColor/);
});
