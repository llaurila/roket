import type Level from "./Level";
import type Vector from "./Physics/Vector";

const MAX_V = 150;

export function panTowardsShip(level: Level, delta: number): void {
    const v = level.ship.v.length();

    // eslint-disable-next-line no-magic-numbers
    level.camera.zoom = 5 - Math.min(99, v) / 33;

    let target: Vector;

    if (v > MAX_V) {
        target = level.ship.pos.add(
            level.ship.v
        ).add(
            level.ship.v.normalize().mul(MAX_V)
        );
    }
    else {
        target = level.ship.pos.add(
            level.ship.v.mul(2)
        );
    }

    const towards = target.sub(level.camera.pos);

    if (towards.length() > 0)
    {
        level.camera.pos = level.camera.pos.add(towards.mul(delta));
    }
}
