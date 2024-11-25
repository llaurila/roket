import type { ConditionalAction } from "../types";
import type Level from ".";
import type Objective from "../Objective";
import { LevelOutro } from "../LevelOutro";
import { ObjectiveState } from "../Objective";

export interface MissionStatus {
    totalObjectives: number;
    clearedObjectives: number;
    failure: boolean;
    message: string|null;
}

export function getMissionStatus(objectives: Objective[]): MissionStatus {
    const status: MissionStatus = {
        totalObjectives: objectives.length,
        clearedObjectives: 0,
        failure: false,
        message: null
    };

    function checkForCleared(objective: Objective) {
        switch (objective.test()) {
            case ObjectiveState.Success:
                status.clearedObjectives++;
                break;
            case ObjectiveState.Failure:
                status.failure = true;
                status.message = objective.getMessage();
                break;
        }
    }

    for (const objective of objectives) {
        if (objective.getState() == ObjectiveState.Success) {
            status.clearedObjectives++;
        }
        else {
            checkForCleared(objective);
        }
    }

    return status;
}

export class LevelEndController {
    private level: Level;
    private rules: ConditionalAction[];

    public constructor(level: Level) {
        this.level = level;
        this.rules = getCompletionRules(level);
    }

    public checkForCompletion() {
        this.rules.forEach(rule => {
            if (rule.condition()) {
                rule.action();
                return;
            }
        });
    }

    public showOutro(): void {
        const outro = new LevelOutro(this.level);
        this.level.physics.add(outro);
        this.level.graphics.add(outro);
    }
}

function getCompletionRules(level: Level): ConditionalAction[] {
    return [
        {
            condition: () => !level.ship.alive,
            action: () => {
                level.failure("YOUR SHIP HAS BEEN DESTROYED.");
            }
        },
        {
            condition: () => level.ship.fuelTank.isEmpty(),
            action: () => {
                level.failure("YOU RAN OUT OF FUEL.");
            }
        },
        {
            condition: () => level.objectivesCleared(),
            action: () => {
                level.success();
            }
        }
    ];
}
