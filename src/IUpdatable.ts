import Physics from "./Physics";

interface IUpdatable {
    id: number;
    update: (time: number, delta: number) => void;
    alive: boolean;
    physics?: Physics;
}

export default IUpdatable;