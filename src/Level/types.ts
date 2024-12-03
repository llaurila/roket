export interface Pos {
    x: number;
    y: number;
}

export interface GameObject {
    id: string;
    type: string;
    position: Pos;
    angularVelocity?: number;
}

export interface LevelSuccessCheck {
    type: string;
    target: string;
}

export interface LevelObjective {
    id: string;
    title: string;
    successChecks?: LevelSuccessCheck[];
    externalSuccessCheck?: string;
    dependsOn?: string|string[];
}

export interface LevelData {
    name: string;
    description: string;

    randomSeed?: number;

    variables: Record<string, unknown>

    cosmos?: boolean;

    ship: {
        fuelTank: {
            currentAmount: number;
        };
    };

    objects: GameObject[];

    objectives: LevelObjective[];
}
