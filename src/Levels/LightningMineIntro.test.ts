import { expect, test } from "vitest";
import LightningMine from "@/LightningMine";
import Fuel from "@/Fuel";

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

test("LightningMineIntro creates one mine and two fuel capsules", async () => {
    installCanvasDomMock();

    const { default: LightningMineIntro } = await import("@/Levels/LightningMineIntro");
    const level = new LightningMineIntro();

    level.createObjects();

    const mines = level.physics.filter(
        (obj): obj is LightningMine => obj instanceof LightningMine
    );
    const fuels = level.physics.filter(
        (obj): obj is Fuel => obj instanceof Fuel
    );

    expect(mines).toHaveLength(1);
    expect(fuels).toHaveLength(2);
    expect(level.ship.hasShield()).toBe(true);
});
