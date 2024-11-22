import Ship from ".";
import Engine from "../Engine";
import { degToRad } from "../Utils";
import { Config } from "../config";

const config = Config.ship;

export function updateEngines(engines: Engine[], time: number, delta: number) {
    for (const engine of engines) {
        engine.update(time, delta);
        engine.applyForcesOnParent();
    }
}

export const initLeftEngine = (ship: Ship) =>
    new Engine(
        ship,
        {
            position: config.engineLeft.position,
            rotation: degToRad(config.engineLeft.angle)
        },
        ship.fuelTank,
        config.engineLeft
    );

export const initRightEngine = (ship: Ship) =>
    new Engine(
        ship,
        {
            position: config.engineRight.position,
            rotation: degToRad(config.engineRight.angle)
        },
        ship.fuelTank,
        config.engineRight
    );
