import Vector from "../Physics/Vector";

let pos = Vector.Zero;
let leftPressed = false;
let activePointer: number | null = null;
let pressId = 0;
let framePressId = 0;
let framePressPosition = Vector.Zero;
const pendingPresses: Vector[] = [];

if (typeof window !== "undefined") {
    window.addEventListener("pointermove", (e: PointerEvent) => {
        if (activePointer === null || activePointer === e.pointerId) {
            pos = new Vector(e.clientX, e.clientY);
        }
    });

    window.addEventListener("pointerdown", (e: PointerEvent) => {
        if (!canStartPress(e)) return;
        if (e.target instanceof HTMLInputElement) return;

        activePointer = e.pointerId;
        pos = new Vector(e.clientX, e.clientY);
        leftPressed = true;
        pendingPresses.push(pos);
    });

    const release = (e: PointerEvent) => {
        if (e.pointerId !== activePointer) return;
        activePointer = null;
        leftPressed = false;
    };
    window.addEventListener("pointerup", release);
    window.addEventListener("pointercancel", release);
    window.addEventListener("blur", () => {
        activePointer = null;
        leftPressed = false;
    });
}

function canStartPress(e: PointerEvent): boolean {
    return !e.defaultPrevented && e.isPrimary && e.button === 0 && activePointer === null;
}

function beginFrame() {
    const next = pendingPresses.shift();
    framePressId = 0;
    if (!next) return;
    framePressPosition = next;
    framePressId = ++pressId;
}

export default {
    beginFrame,
    getPosition: () => pos,
    getPressPosition: () => framePressPosition,
    getPressId: () => framePressId,
    leftPressed: () => leftPressed
};
