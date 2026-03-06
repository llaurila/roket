/* eslint-disable no-magic-numbers */
import { expect, test } from "vitest";
import Ship from "@/Ship";
import Vector from "@/Physics/Vector";
import { Config } from "@/config";
import NPCAIController from "./NPCAIController";

function createShip(position = Vector.Zero): Ship {
    const ship = new Ship(position);
    ship.mass = Config.ship.mass;
    return ship;
}

test("getShipState exposes control-relevant ship properties", () => {
    const ship = createShip();
    ship.rotation = 0.4;
    ship.angularVelocity = 0.25;
    ship.v = new Vector(2, 3);

    const controller = new NPCAIController(ship);
    const state = controller.getShipState();

    expect(state.alive).toBe(true);
    expect(state.mass).toBeCloseTo(ship.getMass(), 6);
    expect(state.rotation).toBeCloseTo(0.4, 6);
    expect(state.angularVelocity).toBeCloseTo(0.25, 6);
    expect(state.fuel.currentAmount).toBeCloseTo(ship.fuelTank.currentAmount, 6);
    expect(state.engines.left.maxThrust).toBe(Config.ship.engineLeft.maxThrust);
    expect(state.engines.right.maxOutputChangeRate).toBe(
        Config.ship.engineRight.maxOutputChangeRate
    );
});

test("control commands balanced thrust toward a target straight ahead", () => {
    const ship = createShip();
    ship.rotation = 0;

    const controller = new NPCAIController(ship);
    controller.setTarget({ pos: new Vector(0, 120) });
    const command = controller.control();
    const debugState = controller.getLastDebugState();

    expect(command.leftThrottle).toBeGreaterThan(0);
    expect(command.leftThrottle).toBeCloseTo(command.rightThrottle, 6);
    expect(debugState).toBeDefined();
    expect(debugState?.desiredAcceleration.dot(ship.getHeading())).toBeGreaterThan(0);
});

test("control rotates for braking when the ship is inside the stopping envelope", () => {
    const ship = createShip();
    ship.rotation = 0;
    ship.v = ship.getHeading().mul(30);

    const controller = new NPCAIController(ship);
    controller.setTarget({
        pos: new Vector(0, 10),
        arriveRadius: 2
    });

    const command = controller.control();
    const debugState = controller.getLastDebugState();

    expect(debugState).toBeDefined();
    if (!debugState) {
        throw new Error("Expected debug state to be defined.");
    }

    expect(debugState.desiredAcceleration.dot(ship.getHeading())).toBeLessThan(0);
    expect(debugState.forwardThrottle).toBe(0);
    expect(Math.abs(debugState.turnCommand)).toBeGreaterThan(0);
    expect(command.leftThrottle).not.toBe(command.rightThrottle);
});