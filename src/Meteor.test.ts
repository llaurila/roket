/* eslint-disable no-magic-numbers */
import { expect, test } from "vitest";
import Meteor from "@/Meteor";
import Vector from "@/Physics/Vector";
import RNG from "@/RNG";
import { createMeteorFromObject } from "@/Level/objectFactories";
import type { GameObject } from "@/Level/types";

function serializeShape(meteor: Meteor): Array<[number, number]> {
    return meteor.shape.pts.map(pt => [
        Number(pt.x.toFixed(6)),
        Number(pt.y.toFixed(6))
    ]);
}

test("meteor generation is deterministic for the same level seed and id", () => {
    const options = { diameter: 10, mass: 12 };
    const seed = RNG.deriveSeed(0, "meteor-a");

    const meteorA = new Meteor(Vector.Zero, options, new RNG(seed));
    const meteorB = new Meteor(Vector.Zero, options, new RNG(seed));
    const meteorC = new Meteor(Vector.Zero, options, new RNG(RNG.deriveSeed(1, "meteor-a")));

    expect(meteorA.cornerCount).toBe(meteorB.cornerCount);
    expect(serializeShape(meteorA)).toEqual(serializeShape(meteorB));
    expect(serializeShape(meteorC)).not.toEqual(serializeShape(meteorA));
});

test("meteor factory validates props and applies kinematics", () => {
    const object: GameObject = {
        id: "meteor-b",
        type: "meteor",
        position: [12, -4],
        velocity: [3, -2],
        angularVelocity: 0.5,
        props: {
            diameter: 18,
            mass: 22,
            cornerCount: 7
        }
    };

    const meteor = createMeteorFromObject(object, new RNG(RNG.deriveSeed(99, object.id)));

    expect(meteor.pos.x).toBe(12);
    expect(meteor.pos.y).toBe(-4);
    expect(meteor.v.x).toBe(3);
    expect(meteor.v.y).toBe(-2);
    expect(meteor.angularVelocity).toBe(0.5);
    expect(meteor.mass).toBe(22);
    expect(meteor.circleCollider.radius).toBe(9);
    expect(meteor.cornerCount).toBe(7);
    expect(meteor.shape.pts).toHaveLength(7);

    expect(() => createMeteorFromObject({
        id: "broken-meteor",
        type: "meteor",
        position: [0, 0],
        props: {
            mass: 10
        }
    }, new RNG(1))).toThrow(/props\.diameter/);

    expect(() => createMeteorFromObject({
        id: "negative-meteor",
        type: "meteor",
        position: [0, 0],
        props: {
            diameter: 8,
            mass: -1
        }
    }, new RNG(1))).toThrow(/props\.mass to be > 0/);
});

