import Fuel from "../../Fuel";
import Vector from "../../Physics/Vector";
import type RNG from "../../RNG";

export function generateFuelCapsule(
    origin: Vector,
    rng: RNG,
    distanceMin: number,
    distanceMax: number
): Fuel {
    return new Fuel(
        origin.add(
            Vector.Up.rotate(rng.next(0, Math.PI * 2))
                .mul(rng.next(distanceMin, distanceMax))
        )
    );
}
