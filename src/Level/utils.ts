import { ConditionalAction } from "../types";
import Level from ".";
import Objective from "../Objective";
import { LevelOutro } from "../LevelOutro";
import { DefaultColor, HudItemDisabled } from "../Hud/HudItem";
import Pointer from "../Controls/Pointer";
import { UI } from "../UI/UI";

export function initUI(level: Level) {
    const ui = new UI(level);
    level.graphics.add(ui);
}

export function initHud(level: Level) {
    const { texts } = level.hud;

    const debugColor = Level.debugMode ? DefaultColor : HudItemDisabled;
    texts.add(() => `PHYSICS  ${level.physics.count}`, debugColor);
    texts.add(() => `GRAPHICS ${level.graphics.count}`, debugColor);

    texts.add(() => {
        const screen = Pointer.getPosition();
        const world = level.camera.toWorldCoordinates(level.ctx, screen);
        return `MOUSE: ${screen} (SCREEN) ${world} (WORLD)`;
    }, debugColor);

    level.graphics.add(level.hud);
}

export function getNumberOfClearedObjectives(objectives: Objective[]) {
    let numCleared = 0;

    function checkForCleared(objective: Objective) {
        if (objective.check()) {
            objective.cleared = true;
            numCleared++;
        }
    }
    
    for (const objective of objectives) {
        if (objective.cleared) {
            numCleared++;
        }
        else {
            checkForCleared(objective);
        }
    }
    
    return numCleared;
}

export class LevelEndController {
    private level: Level;
    private rules: ConditionalAction[];

    constructor(level: Level) {
        this.level = level;
        this.rules = getCompletionRules(level);
    }

    checkForCompletion() {
        this.rules.forEach(rule => {
            if (rule.condition()) {
                rule.action();
                return;
            }
        });
    }

    showOutro(): void {
        const outro = new LevelOutro(this.level);
        this.level.physics.add(outro);
        this.level.graphics.add(outro);
    }
}

function getCompletionRules(level: Level): ConditionalAction[] {
    return [
        {
            condition: () => !level.ship.alive,
            action: () => level.failure("YOUR SHIP HAS BEEN DESTROYED.")
        },
        {
            condition: () => level.ship.fuelTank.isEmpty(),
            action: () => level.failure("YOU RAN OUT OF FUEL.")
        },
        {
            condition: () => level.objectivesCleared(),
            action: () => level.success()
        }
    ];
}
