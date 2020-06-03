let gamepadIndex = -1;
let pressedButtons: boolean[] = [];

window.addEventListener("gamepadconnected", (e: any) => {
    console.log("Gamepad connected at index %d: %s. %d buttons, %d axes.",
        e.gamepad.index, e.gamepad.id,
        e.gamepad.buttons.length, e.gamepad.axes.length);

    gamepadIndex = e.gamepad.index;
});

export default {
    controllerAvailable: () => {
        return gamepadIndex != -1;
    },

    wasPressed: (buttonIndex: number) => {
        if (gamepadIndex == -1) {
            return false;
        }

        const controller = navigator.getGamepads()[gamepadIndex] as any;

        const prev = pressedButtons[buttonIndex] as boolean;
        const current = controller.buttons[buttonIndex].pressed;

        pressedButtons[buttonIndex] = current;

        return !prev && current;
    },

    getAxis: (axisIndex: number) => {
        if (gamepadIndex == -1) {
            return false;
        }

        const controller = navigator.getGamepads()[gamepadIndex] as any;

        return controller.axes[axisIndex];
    }
};