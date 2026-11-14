import { afterEach, describe, expect, test, vi } from "vitest";
import { hasTouchScreen } from "./Device";

afterEach(() => {
    vi.unstubAllGlobals();
});

describe("hasTouchScreen", () => {
    test("detects support for touch points", () => {
        vi.stubGlobal("navigator", { maxTouchPoints: 1 });

        expect(hasTouchScreen()).toBe(true);
    });

    test("detects touch event support as a fallback", () => {
        vi.stubGlobal("navigator", { maxTouchPoints: 0 });
        vi.stubGlobal("window", { ontouchstart: null });

        expect(hasTouchScreen()).toBe(true);
    });

    test("returns false without touch support", () => {
        vi.stubGlobal("navigator", { maxTouchPoints: 0 });
        vi.stubGlobal("window", {});

        expect(hasTouchScreen()).toBe(false);
    });
});
