/* eslint-disable no-magic-numbers */
import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";

class InputElement extends EventTarget {}

function pointerEvent(type: string, values: Partial<PointerEvent> = {}): PointerEvent {
    const event = new Event(type, { cancelable: true });
    Object.assign(event, {
        pointerId: 1, isPrimary: true, button: 0, clientX: 24, clientY: 42, ...values
    });
    return event as PointerEvent;
}

describe("pointer input", () => {
    let win: EventTarget;

    beforeEach(() => {
        vi.resetModules();
        win = new EventTarget();
        vi.stubGlobal("window", win);
        vi.stubGlobal("HTMLInputElement", InputElement);
    });

    afterEach(() => vi.unstubAllGlobals());

    test("retains a short tap and its original position for one frame", async () => {
        const { default: pointer } = await import("./Pointer");
        win.dispatchEvent(pointerEvent("pointerdown"));
        win.dispatchEvent(pointerEvent("pointerup"));
        win.dispatchEvent(pointerEvent("pointermove", { clientX: 90, clientY: 80 }));

        pointer.beginFrame();
        expect(pointer.getPressId()).toBe(1);
        expect(pointer.getPressPosition()).toMatchObject({ x: 24, y: 42 });
        expect(pointer.leftPressed()).toBe(false);
        pointer.beginFrame();
        expect(pointer.getPressId()).toBe(0);
    });

    test("queues multiple presses and ignores secondary and canceled startup events", async () => {
        const { default: pointer } = await import("./Pointer");
        const canceled = pointerEvent("pointerdown");
        canceled.preventDefault();
        win.dispatchEvent(canceled);
        win.dispatchEvent(pointerEvent("pointerdown", { isPrimary: false }));
        win.dispatchEvent(pointerEvent("pointerdown"));
        win.dispatchEvent(pointerEvent("pointercancel"));
        win.dispatchEvent(pointerEvent("pointerdown", { clientX: 50 }));
        win.dispatchEvent(pointerEvent("pointerup"));

        pointer.beginFrame();
        expect(pointer.getPressPosition().x).toBe(24);
        pointer.beginFrame();
        expect(pointer.getPressPosition().x).toBe(50);
        expect(pointer.getPressId()).toBe(2);
        pointer.beginFrame();
        expect(pointer.getPressId()).toBe(0);
    });
});
