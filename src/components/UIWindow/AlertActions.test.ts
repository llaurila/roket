/* eslint-disable no-magic-numbers */
import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";
import Pointer from "@/Controls/Pointer";
import Rectangle from "@/Graphics/Rectangle";
import Vector from "@/Physics/Vector";
import AlertActions from "./AlertActions";

const contentRect = new Rectangle(new Vector(10, 40), new Vector(300, 240));

function createActions() {
    const actions = new AlertActions();
    const retry = vi.fn();
    const next = vi.fn();
    actions.items = [
        { text: "RETRY", onSelect: retry },
        { text: "NEXT LEVEL", primary: true, onSelect: next }
    ];
    return { actions, retry, next };
}

function pressButton(actions: AlertActions, index: number, pressId: number) {
    const rect = actions.getButtonRect(contentRect, index);
    vi.spyOn(Pointer, "getPressId").mockReturnValue(pressId);
    vi.spyOn(Pointer, "getPressPosition").mockReturnValue(
        rect.topLeft.add(rect.size.div(2))
    );
    actions.update(contentRect);
}

beforeEach(() => {
    vi.spyOn(Pointer, "getPressId").mockReturnValue(0);
    vi.spyOn(Pointer, "getActiveTouchCount").mockReturnValue(0);
    vi.spyOn(Pointer, "leftPressed").mockReturnValue(false);
});

afterEach(() => vi.restoreAllMocks());

describe("alert touch actions", () => {
    test("lays out large, separated targets within a narrow panel", () => {
        const { actions } = createActions();
        const retryRect = actions.getButtonRect(contentRect, 0);
        const nextRect = actions.getButtonRect(contentRect, 1);

        expect(retryRect.size.x).toBeGreaterThanOrEqual(48);
        expect(retryRect.size.y).toBeGreaterThanOrEqual(48);
        expect(nextRect.topLeft.x - retryRect.bottomRight.x).toBe(16);
        expect(contentRect.contains(nextRect.bottomRight)).toBe(true);
    });

    test("only selects retry after a fresh press is released, once", () => {
        const { actions, retry, next } = createActions();
        actions.update(contentRect);
        vi.spyOn(Pointer, "getActiveTouchCount").mockReturnValue(1);
        vi.spyOn(Pointer, "leftPressed").mockReturnValue(true);
        pressButton(actions, 0, 1);
        expect(retry).not.toHaveBeenCalled();

        vi.spyOn(Pointer, "getActiveTouchCount").mockReturnValue(0);
        vi.spyOn(Pointer, "leftPressed").mockReturnValue(false);
        actions.update(contentRect);
        actions.update(contentRect);
        expect(retry).toHaveBeenCalledOnce();
        expect(next).not.toHaveBeenCalled();
    });

    test("accepts a short tap on next level", () => {
        const { actions, retry, next } = createActions();
        actions.update(contentRect);
        pressButton(actions, 1, 1);

        expect(next).toHaveBeenCalledOnce();
        expect(retry).not.toHaveBeenCalled();
    });

    test("ignores touches held from gameplay and their release", () => {
        const { actions, next } = createActions();
        vi.spyOn(Pointer, "getActiveTouchCount").mockReturnValue(2);
        pressButton(actions, 1, 1);
        vi.spyOn(Pointer, "getActiveTouchCount").mockReturnValue(1);
        actions.update(contentRect);
        vi.spyOn(Pointer, "getActiveTouchCount").mockReturnValue(0);
        actions.update(contentRect);
        actions.update(contentRect);
        expect(next).not.toHaveBeenCalled();

        pressButton(actions, 1, 2);
        expect(next).toHaveBeenCalledOnce();
    });

    test("tapping outside buttons does nothing", () => {
        const { actions, retry, next } = createActions();
        actions.update(contentRect);
        vi.spyOn(Pointer, "getPressId").mockReturnValue(1);
        vi.spyOn(Pointer, "getPressPosition").mockReturnValue(new Vector(100, 100));
        actions.update(contentRect);

        expect(retry).not.toHaveBeenCalled();
        expect(next).not.toHaveBeenCalled();
    });

    test("a lone retry button fills the row", () => {
        const { actions } = createActions();
        actions.items.pop();
        expect(actions.getButtonRect(contentRect, 0).size.x).toBe(268);
        expect(actions.height).toBe(72);
        actions.items = [];
        expect(actions.height).toBe(0);
    });
});
