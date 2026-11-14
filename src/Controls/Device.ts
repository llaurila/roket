export function hasTouchScreen(): boolean {
    const hasTouchPoints = typeof navigator !== "undefined" && navigator.maxTouchPoints > 0;
    const hasTouchEvents = typeof window !== "undefined" && "ontouchstart" in window;

    return hasTouchPoints || hasTouchEvents;
}
