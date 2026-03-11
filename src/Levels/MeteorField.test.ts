/* eslint-disable no-magic-numbers */
import { expect, test } from "vitest";

function installCanvasDomMock() {
    const ctx = {
        canvas: {
            width: 1024,
            height: 768
        }
    } as CanvasRenderingContext2D;

    const canvas = {
        getContext: () => ctx
    };

    globalThis.document = {
        getElementById: () => canvas
    } as unknown as Document;
}

test("MeteorField spawns fuel capsules and meteors within configured ranges", async () => {
    installCanvasDomMock();

    const { default: MeteorField } = await import("@/Levels/MeteorField");
    const level = new MeteorField();

    level.createObjects();

    expect(level.fuelCapsules).toHaveLength(3);
    expect(level.meteors).toHaveLength(5);

    for (const fuelCapsule of level.fuelCapsules) {
        const distance = fuelCapsule.pos.length();
        expect(distance).toBeGreaterThanOrEqual(100);
        expect(distance).toBeLessThanOrEqual(200);
    }

    for (const meteor of level.meteors) {
        const distance = meteor.pos.length();
        expect(distance).toBeGreaterThanOrEqual(40);
        expect(distance).toBeLessThanOrEqual(90);
    }
});
