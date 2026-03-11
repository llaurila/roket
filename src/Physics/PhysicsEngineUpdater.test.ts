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

function createShieldedShip(position = Vector.Zero): Ship {
    const ship = createShip(position);
    ship.enableShield();
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

test("meteor collision drains shield and bounces when shield is active", () => {
    const physics = new PhysicsEngine(VacuumOfSpace);
    const ship = createShieldedShip();
    const meteor = new Meteor(new Vector(8, 0), {
        diameter: 4,
        mass: 10,
        velocity: new Vector(-4, 0)
    }, new RNG(7));

    physics.add(ship);
    physics.add(meteor);

    physics.update(0, 0.08);

    expect(ship.alive).toBe(true);
    expect(ship.getShieldIntegrity()).toBeLessThan(ship.getShieldMaxIntegrity());
    expect(meteor.v.x).toBeGreaterThan(0);
});

test("shielded ship collision destroys unshielded ship", () => {
    const physics = new PhysicsEngine(VacuumOfSpace);
    const shielded = createShieldedShip();
    const unshielded = createShip(new Vector(7, 0));

    shielded.v = new Vector(2, 0);
    unshielded.v = Vector.Zero;

    physics.add(shielded);
    physics.add(unshielded);

    physics.update(0, 0.25);

    expect(shielded.alive).toBe(true);
    expect(unshielded.alive).toBe(false);
    expect(shielded.getShieldIntegrity()).toBeLessThan(shielded.getShieldMaxIntegrity());
});

test("shielded ships bounce and both lose shield integrity", () => {
    const physics = new PhysicsEngine(VacuumOfSpace);
    const left = createShieldedShip(new Vector(-6, 0));
    const right = createShieldedShip(new Vector(6, 0));

    left.v = new Vector(2, 0);
    right.v = new Vector(-1, 0);

    physics.add(left);
    physics.add(right);

    physics.update(0, 0.25);

    expect(left.alive).toBe(true);
    expect(right.alive).toBe(true);
    expect(left.getShieldIntegrity()).toBeLessThan(left.getShieldMaxIntegrity());
    expect(right.getShieldIntegrity()).toBeLessThan(right.getShieldMaxIntegrity());
    expect(left.v.x).toBeLessThan(0);
    expect(right.v.x).toBeGreaterThan(0);
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

