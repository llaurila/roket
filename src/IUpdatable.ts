interface IUpdatable {
    update: (time: number, delta: number) => void;
    alive: boolean;
}

export default IUpdatable;