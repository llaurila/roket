import Vector from "./Vector";

class Forces {
    F: Vector;
    Torque: number;

    constructor(f: Vector, torque: number) {
        this.F = f;
        this.Torque = torque;
    }

    add(other: Forces): Forces {
        return new Forces(
            this.F.add(other.F),
            this.Torque + other.Torque
        );
    }

    static get Zero() {
        return new Forces(Vector.Zero, 0);
    }
}

export default Forces;
