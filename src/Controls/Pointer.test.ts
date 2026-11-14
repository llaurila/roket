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

    test("tracks simultaneous touches on both screen sides until each is released", async () => {
        Object.assign(win, { innerWidth: 100 });
        const { default: pointer } = await import("./Pointer");

        win.dispatchEvent(pointerEvent("pointerdown", {
            pointerId: 1, pointerType: "touch", clientX: 20
        }));
        win.dispatchEvent(pointerEvent("pointerdown", {
            pointerId: 2, pointerType: "touch", isPrimary: false, clientX: 80
        }));

        expect(pointer.getActiveTouchCount()).toBe(2);
        expect(pointer.leftSidePressed()).toBe(true);
        expect(pointer.rightSidePressed()).toBe(true);

        win.dispatchEvent(pointerEvent("pointerup", { pointerId: 1, pointerType: "touch" }));

        expect(pointer.leftSidePressed()).toBe(false);
        expect(pointer.rightSidePressed()).toBe(true);
        expect(pointer.getActiveTouchCount()).toBe(1);
    });

    test("updates a held touch when it moves across the screen", async () => {
        Object.assign(win, { innerWidth: 100 });
        const { default: pointer } = await import("./Pointer");

        win.dispatchEvent(pointerEvent("pointerdown", {
            pointerType: "touch", clientX: 20
        }));
        win.dispatchEvent(pointerEvent("pointermove", {
            pointerType: "touch", clientX: 80
        }));

        expect(pointer.leftSidePressed()).toBe(false);
        expect(pointer.rightSidePressed()).toBe(true);
    });

    test("ignores touches already held when gameplay starts", async () => {
        Object.assign(win, { innerWidth: 100 });
        const { default: pointer } = await import("./Pointer");

        win.dispatchEvent(pointerEvent("pointerdown", {
            pointerType: "touch", clientX: 20
        }));
        pointer.ignoreCurrentTouches();
        win.dispatchEvent(pointerEvent("pointermove", {
            pointerType: "touch", clientX: 80
        }));

        expect(pointer.leftSidePressed()).toBe(false);
        expect(pointer.rightSidePressed()).toBe(false);

        win.dispatchEvent(pointerEvent("pointerup", { pointerType: "touch" }));
        win.dispatchEvent(pointerEvent("pointerdown", {
            pointerType: "touch", clientX: 80
        }));

        expect(pointer.rightSidePressed()).toBe(true);
    });

    test("tracks touch presses separately from mouse presses", async () => {
        const { default: pointer } = await import("./Pointer");

        win.dispatchEvent(pointerEvent("pointerdown", { pointerType: "mouse" }));
        expect(pointer.getTouchPressId()).toBe(0);

        win.dispatchEvent(pointerEvent("pointerdown", { pointerType: "touch" }));
        expect(pointer.getTouchPressId()).toBe(1);
    });
});
