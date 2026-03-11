/* eslint-disable no-magic-numbers */
import { expect, test, vi } from "vitest";
import Fuel from "@/Fuel";
import Meteor from "@/Meteor";
import { VacuumOfSpace } from "@/Physics/Environment";
import PhysicsEngine from "@/Physics/PhysicsEngine";
import Vector from "@/Physics/Vector";
import RNG from "@/RNG";
import Ship from "@/Ship";
import { Config } from "@/config";

function createMeteor(position: Vector, velocity: Vector, mass: number): Meteor {
    return new Meteor(position, {
        diameter: 2,
        mass,
        velocity
    }, new RNG(mass * 10));
}

function createShip(position = Vector.Zero): Ship {
    const ship = new Ship(position);
    ship.mass = Config.ship.mass;
    return ship;
}

test("meteor collisions bounce based on mass and resolve overlap", () => {
    const physics = new PhysicsEngine(VacuumOfSpace);
    const left = createMeteor(new Vector(-2, 0), new Vector(2, 0), 1);
    const right = createMeteor(new Vector(2, 0), new Vector(-1, 0), 3);

    physics.add(left);
    physics.add(right);

    physics.update(0, 0.75);

    expect(left.v.x).toBeLessThan(0);
    expect(right.v.x).toBeGreaterThan(0);
    expect(left.pos.distanceTo(right.pos)).toBeGreaterThanOrEqual(2);
});

test("meteor collision destroys ships without applying bounce handling", () => {
    const physics = new PhysicsEngine(VacuumOfSpace);
    const ship = createShip();
    const dieSpy = vi.fn(() => {
        ship.hullIntegrity = 0;
        (ship as unknown as { _alive: boolean })._alive = false;
    });

    ship.die = dieSpy;

    const meteor = new Meteor(Vector.Zero, {
        diameter: 4,
        mass: 10
    }, new RNG(5));

    physics.add(ship);
    physics.add(meteor);

    physics.update(0, 0);

    expect(dieSpy).toHaveBeenCalledTimes(1);
    expect(ship.alive).toBe(false);
    expect(meteor.alive).toBe(true);
});

test("collision callbacks still allow ship fuel collection after the two-pass update", () => {
    const physics = new PhysicsEngine(VacuumOfSpace);
    const ship = createShip();
    const fuel = new Fuel(Vector.Zero);

    ship.fuelTank.currentAmount = 0;

    fuel.onCollision(e => {
        if (e.target == ship) {
            fuel.collect(ship);
        }
    });

    physics.add(ship);
    physics.add(fuel);

    physics.update(0, 0);

    expect(fuel.collected).toBe(true);
    expect(ship.fuelTank.currentAmount).toBe(fuel.amount);
});

