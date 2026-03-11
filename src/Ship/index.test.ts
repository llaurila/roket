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
