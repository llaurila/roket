import Vector from "../Physics/Vector";

let pos = Vector.Zero;
let leftPressed = false;
let activePointer: number | null = null;
let pressId = 0;
let framePressId = 0;
let framePressPosition = Vector.Zero;
let touchPressId = 0;
const pendingPresses: Vector[] = [];
const touchPositions = new Map<number, number>();

if (typeof window !== "undefined") {
    window.addEventListener("pointermove", (e: PointerEvent) => {
        if (touchPositions.has(e.pointerId)) {
            touchPositions.set(e.pointerId, e.clientX);
        }
        if (activePointer === null || activePointer === e.pointerId) {
            pos = new Vector(e.clientX, e.clientY);
        }
    });

    window.addEventListener("pointerdown", (e: PointerEvent) => {
        if (isTouchPress(e)) {
            touchPositions.set(e.pointerId, e.clientX);
            touchPressId++;
        }
        if (!canStartPress(e)) return;
        if (e.target instanceof HTMLInputElement) return;

        activePointer = e.pointerId;
        pos = new Vector(e.clientX, e.clientY);
        leftPressed = true;
        pendingPresses.push(pos);
    });

    const release = (e: PointerEvent) => {
        touchPositions.delete(e.pointerId);
        if (e.pointerId !== activePointer) return;
        activePointer = null;
        leftPressed = false;
    };
    window.addEventListener("pointerup", release);
    window.addEventListener("pointercancel", release);
    window.addEventListener("blur", () => {
        activePointer = null;
        leftPressed = false;
        touchPositions.clear();
    });
}

function isTouchPress(e: PointerEvent): boolean {
    return !e.defaultPrevented && e.pointerType === "touch" && e.button === 0 &&
        !(e.target instanceof HTMLInputElement);
}

function canStartPress(e: PointerEvent): boolean {
    return !e.defaultPrevented && e.isPrimary && e.button === 0 && activePointer === null;
}

function isTouchSidePressed(leftSide: boolean): boolean {
    if (typeof window === "undefined") return false;

    const midpoint = window.innerWidth / 2;
    return [...touchPositions.values()].some(x => leftSide ? x < midpoint : x >= midpoint);
}

function ignoreCurrentTouches(): void {
    touchPositions.clear();
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
    getTouchPressId: () => touchPressId,
    getActiveTouchCount: () => touchPositions.size,
    leftPressed: () => leftPressed,
    leftSidePressed: () => isTouchSidePressed(true),
    rightSidePressed: () => isTouchSidePressed(false),
    ignoreCurrentTouches
};
