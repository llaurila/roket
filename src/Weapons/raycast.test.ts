/* eslint-disable no-magic-numbers */
import { expect, test } from "vitest";
import Meteor from "@/Meteor";
import { VacuumOfSpace } from "@/Physics/Environment";
import PhysicsEngine from "@/Physics/PhysicsEngine";
import Vector from "@/Physics/Vector";
import RNG from "@/RNG";
import { raycastMeteors } from "./raycast";

function createMeteor(position: Vector, diameter: number): Meteor {
    return new Meteor(position, {
        diameter,
        mass: 10
    }, new RNG(position.x + position.y + diameter));
}

test("raycast returns the closest meteor hit", () => {
    const physics = new PhysicsEngine(VacuumOfSpace);
    const nearMeteor = createMeteor(new Vector(10, 0), 4);
    const farMeteor = createMeteor(new Vector(20, 0), 4);

    physics.add(nearMeteor);
    physics.add(farMeteor);

    const hit = raycastMeteors(physics, Vector.Zero, Vector.UnitX, 100);

    expect(hit).not.toBeNull();

    if (!hit) {
        throw new Error("Expected a raycast hit.");
    }

    expect(hit.body).toBe(nearMeteor);
    expect(hit.distance).toBeCloseTo(8, 6);
    expect(hit.point.x).toBeCloseTo(8, 6);
    expect(hit.point.y).toBeCloseTo(0, 6);
});

test("raycast returns null when no meteor intersects the ray", () => {
    const physics = new PhysicsEngine(VacuumOfSpace);
    physics.add(createMeteor(new Vector(0, 10), 2));

    const hit = raycastMeteors(physics, Vector.Zero, Vector.UnitX, 100);

    expect(hit).toBeNull();
});
