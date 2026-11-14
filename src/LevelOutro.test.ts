import { afterEach, describe, expect, test, vi } from "vitest";
import { hasTouchScreen } from "@/Controls/Device";
import type Level from "@/Level";
import { LevelOutro } from "./LevelOutro";

vi.mock("@/Controls/Device", () => ({ hasTouchScreen: vi.fn(() => true) }));

function createLevel(passed = true, hasNextLevel = true): Level {
    return Object.assign(new EventTarget(), {
        passed,
        hasNextLevel,
        failureMessage: passed ? undefined : "OUT OF FUEL",
        stats: { toString: () => "MISSION STATS" },
        physics: { time: 0 }
    }) as unknown as Level;
}

afterEach(() => vi.clearAllMocks());

describe("level result controls", () => {
    test("touch success has retry and next buttons instead of keyboard instructions", () => {
        const level = createLevel();
        const retry = vi.fn();
        const next = vi.fn();
        level.addEventListener("retry", retry);
        level.addEventListener("continue", next);
        const { alert } = new LevelOutro(level);

        expect(alert.actions.items.map(action => action.text)).toEqual(["RETRY", "NEXT LEVEL"]);
        expect(alert.content).not.toMatch(/ESC|ENTER|TAP/);
        alert.actions.items[0].onSelect();
        expect(retry).toHaveBeenCalledOnce();
        expect(next).not.toHaveBeenCalled();
        alert.actions.items[1].onSelect();
        expect(next).toHaveBeenCalledOnce();
    });

    test("touch failure has only a primary retry action", () => {
        const { alert } = new LevelOutro(createLevel(false));

        expect(alert.title).toBe("MISSION FAILED");
        expect(alert.content).toContain("OUT OF FUEL");
        expect(alert.content).not.toContain("ESC");
        expect(alert.actions.items).toMatchObject([{ text: "RETRY", primary: true }]);
        expect(alert.actions.items).toHaveLength(1);
    });

    test("final level has no next level action", () => {
        const { alert } = new LevelOutro(createLevel(true, false));

        expect(alert.actions.items).toHaveLength(1);
        expect(alert.actions.items[0]).toMatchObject({ text: "RETRY", primary: true });
    });

    test("keyboard users keep Enter and Escape hints without touch buttons", () => {
        vi.mocked(hasTouchScreen).mockReturnValueOnce(false).mockReturnValueOnce(false);
        const { alert } = new LevelOutro(createLevel());

        expect(alert.content).toContain("<ENTER>");
        expect(alert.content).toContain("<ESC>");
        expect(alert.actions.items).toHaveLength(0);
    });
});
