/* eslint-disable no-magic-numbers */
import { expect, test } from "vitest";
import Meteor from "@/Meteor";
import { VacuumOfSpace } from "@/Physics/Environment";
import PhysicsEngine from "@/Physics/PhysicsEngine";
import Vector from "@/Physics/Vector";
import RNG from "@/RNG";
import Ship from "@/Ship";
import { Config } from "@/config";
import { Laser } from "./Laser";

function createShip(position = Vector.Zero): Ship {
    const ship = new Ship(position);
    ship.mass = Config.ship.mass;
    return ship;
}

function createMeteor(position: Vector): Meteor {
    return new Meteor(position, {
        diameter: 6,
        mass: 10
    }, new RNG(42));
}

test("laser drains energy while firing and recharges after delay", () => {
    const ship = createShip();
    const laser = new Laser(ship);

    laser.setTriggerDown(true);
    laser.update(0, 1);

    const drainedEnergy = laser.getHudGauge().current;
    expect(drainedEnergy).toBeLessThan(Config.laser.maxEnergy);

    laser.setTriggerDown(false);
    laser.update(1, Config.laser.rechargeDelay * 0.5);
    expect(laser.getHudGauge().current).toBeCloseTo(drainedEnergy, 6);

    laser.update(2, Config.laser.rechargeDelay + 1);
    laser.update(3, 1);
    expect(laser.getHudGauge().current).toBeGreaterThan(drainedEnergy);
});

test("laser ray is cut at the first meteor hit", () => {
    const physics = new PhysicsEngine(VacuumOfSpace);
    const ship = createShip();
    const meteor = createMeteor(new Vector(20, 0));

    ship.rotation = -Math.PI / 2;

    physics.add(ship);
    physics.add(meteor);

    const laser = new Laser(ship);
    laser.setTriggerDown(true);
    laser.update(0, 0.1);

    const hit = laser.getLastHit();
    expect(hit).not.toBeNull();
    expect(hit?.body).toBe(meteor);
    expect(hit?.point.x).toBeCloseTo(17, 1);
    expect(hit?.point.y).toBeCloseTo(0, 1);
});
