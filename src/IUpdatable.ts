interface IUpdatable {
    id: number;
    update: (time: number, delta: number) => void;
    alive: boolean;
}

export default IUpdatable;