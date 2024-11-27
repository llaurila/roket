import type Level from ".";
import { DefaultColor, HudItemDisabled } from "../components/Hud/HudItem";
import { UI } from "../components/UI/UI";
import Pointer from "../Controls/Pointer";
import Game from "../Game";

export function initUI(level: Level) {
    const ui = new UI(level);
    level.graphics.add(ui);
}

export function initHud(level: Level) {
    const { texts } = level.hud;

    const debugColor = Game.debugMode ? DefaultColor : HudItemDisabled;

    texts.add(() => {
        const screen = Pointer.getPosition();
        const world = level.camera.toWorldCoordinates(level.ctx, screen);
        return `MOUSE: ${screen.toString(0)} (SCREEN) ${world.toString()} (WORLD)`;
    }, debugColor);

    level.graphics.add(level.hud);
}
