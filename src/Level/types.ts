export type Pos = number[];

export interface GameObject {
    id: string;
    type: string;
    position: Pos;
    velocity?: Pos;
    angularVelocity?: number;
    props?: Record<string, unknown>;
}

export interface LevelSuccessCheck {
    type: string;
    target: string;
}

export interface LevelObjective {
    id: string;
    title: string;
    successChecks?: LevelSuccessCheck[];
    externalSuccessCheck?: string | { test: string; args?: unknown[] };
    externalFailureCheck?: {
        test: string;
        message: string;
    };
    dependsOn?: string|string[];
}

export interface LevelData {
    name: string;
    description: string;

    soundtrack?: string;

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

