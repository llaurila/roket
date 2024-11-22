import Fuel from "../../Fuel";
import Vector from "../../Physics/Vector";
import GameOfTag from ".";
import LevelConfig from "./config";

export function generateFuelCapsule(level: GameOfTag) {
    return new Fuel(
        level.ship.pos.add(
            Vector.Up.rotate(level.rng.next(0, Math.PI * 2))
                .mul(level.rng.next(
                    LevelConfig.FUEL_CAPSULE_DISTANCE_MIN,
                    LevelConfig.FUEL_CAPSULE_DISTANCE_MAX))
        )
    );
}
