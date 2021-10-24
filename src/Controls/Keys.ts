let keysDown: any = {};
let wasDown: any = {};

window.addEventListener("keydown", (e: KeyboardEvent) => {
    keysDown[e.keyCode] = true;
});

window.addEventListener("keyup", (e: KeyboardEvent) => {
    keysDown[e.keyCode] = false;
});

const isDown = (keyCode: number) => <boolean> keysDown[keyCode];

export default {
    isDown,

    wasPressed: (keyCode: number): boolean => {
        const down = isDown(keyCode);
        const result = !wasDown[keyCode] && down;
        wasDown[keyCode] = down;
        return result;
    }
};
