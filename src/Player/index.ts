import { Store } from "@/store";

const PL1_DEFAULT_NAME = "ROKETMAN";

const NAME_PATTERN = /^[A-Z]{1,10}$/;

export class Player {
    public static PL1 = new Player(0, PL1_DEFAULT_NAME);

    public constructor(
        private _index: number,
        private _name: string
    ) {
        const name = Store.retrieve(
            getPlayerPropertyKey("name", this._index)
        );
        if (name !== null) {
            this._name = name;
        }
    }

    public get index(): number {
        return this._index;
    }

    public get name(): string {
        return this._name;
    }

    public isValidName(name: string): boolean {
        return NAME_PATTERN.test(name);
    }

    public setName(name: string): void {
        if (!this.isValidName(name)) {
            throw new Error("Invalid name");
        }
        this._name = name;
        Store.persist(
            getPlayerPropertyKey("name", this._index),
            name
        );
    }
}

function getPlayerPropertyKey(propName: string, playerIndex: number) {
    return `player[${playerIndex}].${propName}`;
}
