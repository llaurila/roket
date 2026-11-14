import type Level from "./Level";
import type Vector from "./Physics/Vector";
import { Config } from "./config";

const VIEWPORT_SAFE_HALF_RATIO = 0.4;

type CameraTrackingLevel = Pick<Level, "ship" | "viewport">;

export function panTowardsShip(level: CameraTrackingLevel, delta: number): void {
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

    const velocityZoom = Math.max(
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

    camera.zoom = Math.min(velocityZoom, getViewportZoom(level));
}

function getViewportZoom({ ship, viewport }: CameraTrackingLevel): number {
    const offset = ship.pos.sub(viewport.camera.pos);
    const radius = ship.circleCollider.radius;

    // Fit the rocket inside the central 80%, including camera lag and look-ahead.
    // This limit may go below minZoom when the viewport is too small to fit otherwise.
    return Math.min(
        viewport.width * VIEWPORT_SAFE_HALF_RATIO / (Math.abs(offset.x) + radius),
        viewport.height * VIEWPORT_SAFE_HALF_RATIO / (Math.abs(offset.y) + radius)
    );
}
