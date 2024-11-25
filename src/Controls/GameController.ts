let gamepadIndex = -1;
const pressedButtons: boolean[] = [];

window.addEventListener("gamepadconnected", e => {
    // eslint-disable-next-line no-console
    console.log("Gamepad connected at index %d: %s. %d buttons, %d axes.",
        e.gamepad.index, e.gamepad.id,
        e.gamepad.buttons.length, e.gamepad.axes.length);

    gamepadIndex = e.gamepad.index;
});

export default {
    controllerAvailable: () => {
        return gamepadIndex != -1;
    },

    wasPressed: (buttonIndex: number): boolean => {
        if (gamepadIndex != -1) {
            const controller = navigator.getGamepads()[gamepadIndex];

            if (controller) {
                return wasPressed(buttonIndex, controller);
            }
        }

        throw new Error("Unknown button.");
    },

    getAxis: (axisIndex: number): number => {
        if (gamepadIndex != -1) {
            const controller = navigator.getGamepads()[gamepadIndex];

            if (controller) {
                return controller.axes[axisIndex];
            }
        }
        throw new Error("Unknown axis.");
    }
};

function wasPressed(buttonIndex: number, controller: Gamepad) {
    const prev = pressedButtons[buttonIndex];
    const current = controller.buttons[buttonIndex].pressed;
    pressedButtons[buttonIndex] = current;
    return !prev && current;
}
