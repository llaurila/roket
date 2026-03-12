/* eslint-disable no-magic-numbers */
import { expect, test } from "vitest";
import Ship from "@/Ship";
import Vector from "@/Physics/Vector";
import { Config } from "@/config";

test("shield depletes and destroys ship", () => {
    const ship = new Ship(Vector.Zero);

    ship.enableShield(0.01);
    ship.absorbShieldImpact(100);

    expect(ship.alive).toBe(false);
    expect(ship.getShieldIntegrity()).toBe(0);
});

test("shield starts disabled by default", () => {
    const ship = new Ship(Vector.Zero);

    expect(ship.hasShield()).toBe(false);
    expect(ship.getShieldIntegrity()).toBe(0);
});

test("shield recharge waits for lock delay", () => {
    const ship = new Ship(Vector.Zero);

    ship.enableShield();
    ship.absorbShieldImpact(20);

    const damagedIntegrity = ship.getShieldIntegrity();

    ship.update(0, Config.ship.shield.rechargeDelay * 0.5);
    expect(ship.getShieldIntegrity()).toBeCloseTo(damagedIntegrity, 6);

    ship.update(0, Config.ship.shield.rechargeDelay + 1);
    expect(ship.getShieldIntegrity()).toBeGreaterThan(damagedIntegrity);
});

test("applyVelocityDamp clamps multiplier and scales velocity", () => {
    const ship = new Ship(Vector.Zero);
    ship.v = new Vector(10, -4);

    ship.applyVelocityDamp(0.5);

    expect(ship.v.x).toBe(5);
    expect(ship.v.y).toBe(-2);

    ship.applyVelocityDamp(-1);
    expect(ship.v.length()).toBe(0);
});

test("drainShield depletes integrity and can destroy ship", () => {
    const ship = new Ship(Vector.Zero);
    ship.enableShield(0.3);

    ship.drainShield(0.1, 1);
    expect(ship.alive).toBe(true);
    expect(ship.getShieldIntegrity()).toBeCloseTo(0.2, 6);

    ship.drainShield(1);
    expect(ship.alive).toBe(false);
    expect(ship.getShieldIntegrity()).toBe(0);
});

test("drainShield is ignored when shield is disabled", () => {
    const ship = new Ship(Vector.Zero);
    ship.v = new Vector(4, 0);

    ship.drainShield(0.5, 1);

    expect(ship.alive).toBe(true);
    expect(ship.getShieldIntegrity()).toBe(0);
});
