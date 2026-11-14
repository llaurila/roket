import { afterEach, describe, expect, test, vi } from "vitest";
import type { Viewport } from "@/Graphics/Viewport";

vi.mock("@/Graphics/Graphics", () => ({
    initializeGraphics: vi.fn(() => ({}))
}));

import Game from ".";

describe("Game", () => {
    afterEach(() => vi.unstubAllGlobals());

    test("does not process a queued frame after the game is stopped", () => {
        const frames: (() => void)[] = [];
        const requestAnimationFrame = vi.fn((callback: FrameRequestCallback) => {
            frames.push(() => {
                callback(0);
            });
            return 0;
        });
        vi.stubGlobal("window", { requestAnimationFrame });

        const update = vi.fn();
        const draw = vi.fn();
        const game = new Game(update, draw, {} as Viewport);

        game.start();
        game.stop();
        frames[0]();

        expect(update).not.toHaveBeenCalled();
        expect(draw).not.toHaveBeenCalled();
        expect(requestAnimationFrame).toHaveBeenCalledOnce();
    });
});
