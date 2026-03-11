type KeyMap = Record<string, boolean>;

const keysDown: KeyMap = {};
const wasDown: KeyMap = {};

if (typeof window !== "undefined") {
    window.addEventListener("keydown", (e: KeyboardEvent) => {
        keysDown[e.key] = true;
    });

    window.addEventListener("keyup", (e: KeyboardEvent) => {
        keysDown[e.key] = false;
    });
}

const isDown = (key: string) => keysDown[key];

function wasPressed(key: string): boolean {
    const down = isDown(key);
    const result = !wasDown[key] && down;
    wasDown[key] = down;
    return result;
}

export default {
    isDown,
    wasPressed
};
