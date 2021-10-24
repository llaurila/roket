import PhysicsEngine from "./PhysicsEngine";

interface IUpdatable {
    id: number;
    update: (time: number, delta: number) => void;
    alive: boolean;
    physics?: PhysicsEngine;
}

export default IUpdatable;
