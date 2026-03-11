/* eslint-disable no-magic-numbers */
import { expect, test } from "vitest";
import Meteor from "@/Meteor";
import ExplosionParticleEngine from "@/Graphics/ExplosionParticleEngine";
import { Graphics } from "@/Graphics/Graphics";
import { VacuumOfSpace } from "@/Physics/Environment";
import PhysicsEngine from "@/Physics/PhysicsEngine";
import Vector from "@/Physics/Vector";
import RNG from "@/RNG";
import { createMeteorFromObject } from "@/Level/objectFactories";
import type { GameObject } from "@/Level/types";

function serializeShape(meteor: Meteor): [number, number][] {
    return meteor.shape.pts.map(pt => [
        Number(pt.x.toFixed(6)),
        Number(pt.y.toFixed(6))
    ]);
}

function setupMeteor(meteor: Meteor) {
    const physics = new PhysicsEngine(VacuumOfSpace);
    const graphics = new Graphics();

    physics.add(meteor);
    graphics.add(meteor);

    return { physics, meteor };
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
            cornerCount: 7,
            strength: 1.5
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
    expect(meteor.strength).toBe(1.5);
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

    expect(() => createMeteorFromObject({
        id: "too-weak-meteor",
        type: "meteor",
        position: [0, 0],
        props: {
            diameter: 8,
            mass: 10,
            strength: 0
        }
    }, new RNG(1))).toThrow(/props\.strength to be > 0/);
});

test("heated meteor explodes into two non-overlapping fragments that drift apart", () => {
    const { physics, meteor } = setupMeteor(new Meteor(Vector.Zero, {
        diameter: 12,
        mass: 20,
        strength: 0.5
    }, new RNG(123)));

    meteor.applyLaserHeat(0.5);

    const fragments = physics.filter(
        (obj): obj is Meteor => obj instanceof Meteor && obj.alive
    );

    expect(meteor.alive).toBe(false);
    expect(fragments).toHaveLength(2);

    const [a, b] = fragments;

    expect(a.diameter).toBeCloseTo(6, 6);
    expect(b.diameter).toBeCloseTo(6, 6);

    const minDistance = a.circleCollider.radius + b.circleCollider.radius;
    expect(a.pos.distanceTo(b.pos)).toBeGreaterThanOrEqual(minDistance);

    const separation = b.pos.sub(a.pos);
    const relativeVelocity = b.v.sub(a.v);
    expect(separation.dot(relativeVelocity)).toBeGreaterThan(0);

    const explosions = physics.filter(
        (obj): obj is ExplosionParticleEngine => obj instanceof ExplosionParticleEngine
    );
    expect(explosions).toHaveLength(1);
});

test("meteor below split size threshold disappears after explosion", () => {
    const { physics, meteor } = setupMeteor(new Meteor(Vector.Zero, {
        diameter: 8,
        mass: 20,
        strength: 0.25
    }, new RNG(456)));

    meteor.applyLaserHeat(0.25);

    const aliveMeteors = physics.filter(
        (obj): obj is Meteor => obj instanceof Meteor && obj.alive
    );

    expect(meteor.alive).toBe(false);
    expect(aliveMeteors).toHaveLength(0);

    const explosions = physics.filter(
        (obj): obj is ExplosionParticleEngine => obj instanceof ExplosionParticleEngine
    );
    expect(explosions).toHaveLength(1);
});

