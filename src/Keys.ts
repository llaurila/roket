let keysDown: any = {};

window.addEventListener("keydown", (e: KeyboardEvent) => {
    keysDown[e.keyCode] = true;
});

window.addEventListener("keyup", (e: KeyboardEvent) => {
    keysDown[e.keyCode] = false;
});

export default {
    isPressed: (keyCode: number) => <boolean> keysDown[keyCode]
};