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
