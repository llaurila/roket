import type Level from "./Level";
import type Vector from "./Physics/Vector";
import { Config } from "./config";

export function panTowardsShip(level: Level, delta: number): void {
    const { camera } = level.viewport;

    const v = level.ship.v.length();

    const {
        defaultZoom,
        minZoom,
        zoomVelocityCap,
        zoomScale,
        lookAheadMultiplier,
        maxLookAhead,
        panSmoothing
    } = Config.camera;

    camera.zoom = Math.max(
        minZoom,
        defaultZoom - Math.min(zoomVelocityCap, v) / zoomScale
    );

    let target: Vector;

    if (v > maxLookAhead) {
        target = level.ship.pos.add(
            level.ship.v
        ).add(
            level.ship.v.normalize().mul(maxLookAhead)
        );
    }
    else {
        target = level.ship.pos.add(
            level.ship.v.mul(lookAheadMultiplier)
        );
    }

    const towards = target.sub(camera.pos);

    if (towards.length() > 0)
    {
        camera.pos = camera.pos.add(towards.mul(delta * panSmoothing));
    }
}
