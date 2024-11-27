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

export interface LevelData {
    name: string;
    description: string;

    cosmos?: boolean;

    ship: {
        fuelTank: {
            currentAmount: number;
        };
    };

    objects: GameObject[];

    objectives: {
        id: string;
        title: string;
        successCheck: string;
    }[];
}
