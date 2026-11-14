/* eslint-disable no-magic-numbers */
import { expect, test } from "vitest";
import Camera from "@/Graphics/Camera";
import { Viewport } from "@/Graphics/Viewport";
import Vector from "@/Physics/Vector";
import Ship from "@/Ship";
import { Config } from "./config";
import { panTowardsShip } from "./cinematics";

function createTrackingLevel(width: number, height: number, velocity = Vector.Zero) {
    const context = { canvas: { width, height } } as CanvasRenderingContext2D;
    const camera = new Camera(Vector.Zero, Config.camera.defaultZoom);
    const viewport = new Viewport(context, camera);
    const ship = new Ship(Vector.Zero);
    ship.v = velocity;
    return { ship, viewport };
}

function expectShipInsideViewport(level: ReturnType<typeof createTrackingLevel>): void {
    const { ship, viewport } = level;
    const offset = ship.pos.sub(viewport.camera.pos);
    const radius = ship.circleCollider.radius;
    const { zoom } = viewport.camera;

    expect((Math.abs(offset.x) + radius) * zoom).toBeLessThanOrEqual(viewport.width * 0.4);
    expect((Math.abs(offset.y) + radius) * zoom).toBeLessThanOrEqual(viewport.height * 0.4);
}

test.each([0, 33, 99, 200])("preserves speed-based zoom on a large viewport at speed %s", speed => {
    const level = createTrackingLevel(3840, 2160, new Vector(speed, 0));

    panTowardsShip(level, 1);

    const { defaultZoom, minZoom, zoomVelocityCap, zoomScale } = Config.camera;
    expect(level.viewport.camera.zoom).toBe(
        Math.max(minZoom, defaultZoom - Math.min(zoomVelocityCap, speed) / zoomScale)
    );
});

test.each([
    [844, 390, 0, 100],
    [844, 390, 0, -100],
    [844, 390, 0, 300],
    [844, 390, 200, 200],
    [390, 844, 100, 0],
    [390, 844, -100, 0]
])("keeps the rocket visible in a %sx%s viewport at velocity (%s, %s)", (w, h, x, y) => {
    const level = createTrackingLevel(w, h, new Vector(x, y));

    panTowardsShip(level, 1);

    expectShipInsideViewport(level);
    expect(level.viewport.camera.zoom).toBeLessThan(Config.camera.minZoom);
});

test("accounts for camera lag, not just the look-ahead target", () => {
    const level = createTrackingLevel(844, 390, new Vector(0, 100));
    level.ship.pos = new Vector(1000, -1000);

    panTowardsShip(level, 1 / 60);

    expectShipInsideViewport(level);
});

test("keeps zoom finite when the rocket is centered and stationary", () => {
    const level = createTrackingLevel(844, 390);

    panTowardsShip(level, 1 / 60);

    expect(level.viewport.camera.zoom).toBe(Config.camera.defaultZoom);
    expectShipInsideViewport(level);
});

test("recalculates zoom when the viewport size changes", () => {
    const level = createTrackingLevel(3840, 2160, new Vector(0, 100));
    panTowardsShip(level, 1);
    expect(level.viewport.camera.zoom).toBe(Config.camera.minZoom);

    level.viewport.ctx.canvas.width = 844;
    level.viewport.ctx.canvas.height = 390;
    level.viewport = new Viewport(level.viewport.ctx, level.viewport.camera);
    panTowardsShip(level, 1 / 60);
    expectShipInsideViewport(level);

    level.viewport.ctx.canvas.width = 3840;
    level.viewport.ctx.canvas.height = 2160;
    level.viewport = new Viewport(level.viewport.ctx, level.viewport.camera);
    panTowardsShip(level, 1 / 60);
    expect(level.viewport.camera.zoom).toBe(Config.camera.minZoom);
});
