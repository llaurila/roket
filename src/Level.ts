import Physics from "./Physics";

abstract class Level {
    abstract getPhysics(): Physics;

    abstract createObjects(): void;
}

export default Level;