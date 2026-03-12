/* eslint-disable no-magic-numbers */
import { expect, test } from "vitest";
import LightningMine, { LightningMineState } from "@/LightningMine";
import { VacuumOfSpace } from "@/Physics/Environment";
import PhysicsEngine from "@/Physics/PhysicsEngine";
import Ship from "@/Ship";
import Vector from "@/Physics/Vector";

function createShip(position: Vector): Ship {
    const ship = new Ship(position);
    ship.mass = 800;
    return ship;
}

test("mine transitions from idle to charging before pulse", () => {
    const mine = new LightningMine(Vector.Zero, {
        pulseInterval: 1.2,
        chargeDuration: 0.3,
        pulseFlashDuration: 0.05
    });

    mine.update(0, 0.5);
    expect(mine.getPulseState()).toBe(LightningMineState.Idle);

    mine.update(0.91, 0.41);
    expect(mine.getPulseState()).toBe(LightningMineState.Charging);
});

test("mine keeps visual ring size independent from gameplay range", () => {
    const mine = new LightningMine(Vector.Zero, {
        range: 100,
        visualRange: 26
    });

    let pulseCount = 0;
    mine.onPulse(() => {
        pulseCount++;
    });

    mine.update(1.4, 1.4);
    expect(pulseCount).toBeGreaterThan(0);
});

test("mine emits pulse callbacks at configured interval", () => {
    const mine = new LightningMine(Vector.Zero, {
        pulseInterval: 0.5,
        chargeDuration: 0.1,
        pulseFlashDuration: 0.2
    });

    let pulses = 0;
    mine.onPulse(() => {
        pulses++;
    });

    mine.update(0.2, 0.2);
    expect(pulses).toBe(0);

    mine.update(0.51, 0.31);
    expect(pulses).toBe(1);
    expect(mine.getPulseState()).toBe(LightningMineState.Pulse);

    mine.update(0.72, 0.21);
    expect(pulses).toBe(1);
});

test("mine tracks nearby ships for proximity zaps", () => {
    const physics = new PhysicsEngine(VacuumOfSpace);

    const mine = new LightningMine(Vector.Zero, {
        proximityRange: 30,
        maxProximityTargets: 5
    });
    const nearShip = createShip(new Vector(10, 0));
    const farShip = createShip(new Vector(35, 0));

    physics.add(mine);
    physics.add(nearShip);
    physics.add(farShip);

    physics.update(0, 0);

    expect(mine.getProximityTargetCount()).toBe(1);
});

test("mine pulse affects shielded and unshielded ships in range", () => {
    const physics = new PhysicsEngine(VacuumOfSpace);

    const mine = new LightningMine(Vector.Zero, {
        range: 20,
        pulseInterval: 0.5,
        inRangePulseInterval: 0.5,
        chargeDuration: 0.1,
        shieldDrainPerPulse: 0.2,
        velocityMultiplierPerPulse: 0.5,
        shieldRechargeLockSeconds: 0.2
    });

    const shielded = createShip(new Vector(10, 0));
    shielded.enableShield(1);
    shielded.v = new Vector(8, 0);

    const unshielded = createShip(new Vector(12, 0));
    unshielded.v = new Vector(6, 0);

    const outOfRange = createShip(new Vector(30, 0));
    outOfRange.enableShield(1);
    outOfRange.v = new Vector(9, 0);

    physics.add(mine);
    physics.add(shielded);
    physics.add(unshielded);
    physics.add(outOfRange);

    physics.update(0.51, 0.51);

    expect(shielded.v.x).toBeCloseTo(4, 6);
    expect(shielded.getShieldIntegrity()).toBeLessThan(1);

    expect(unshielded.v.x).toBeCloseTo(3, 6);
    expect(unshielded.getShieldIntegrity()).toBe(0);

    expect(outOfRange.v.x).toBeCloseTo(9, 6);
    expect(outOfRange.getShieldIntegrity()).toBe(1);
});

test("mine option resolver clamps invalid timings to safe defaults", () => {
    const mine = new LightningMine(Vector.Zero, {
        pulseInterval: -1,
        chargeDuration: 9,
        pulseFlashDuration: -2
    });

    let pulses = 0;
    mine.onPulse(() => {
        pulses++;
    });

    mine.update(0.2, 0.2);
    expect(pulses).toBe(0);

    mine.update(1.4, 1.2);
    expect(pulses).toBeGreaterThan(0);
});

test("mine pulses faster while ships are inside gameplay range", () => {
    const physics = new PhysicsEngine(VacuumOfSpace);

    const mine = new LightningMine(Vector.Zero, {
        range: 30,
        pulseInterval: 1,
        inRangePulseInterval: 0.25,
        chargeDuration: 0.05,
        pulseFlashDuration: 0.05
    });

    let pulses = 0;
    mine.onPulse(() => {
        pulses++;
    });

    const inRangeShip = createShip(new Vector(10, 0));

    physics.add(mine);
    physics.add(inRangeShip);

    physics.update(0.8, 0.8);
    expect(pulses).toBe(3);
});
