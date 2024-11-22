import Vector from "./Vector";

class Forces {
    public F: Vector;
    public Torque: number;

    public constructor(f: Vector, torque: number) {
        this.F = f;
        this.Torque = torque;
    }

    public add(other: Forces): Forces {
        return new Forces(
            this.F.add(other.F),
            this.Torque + other.Torque
        );
    }

    public static get Zero() {
        return new Forces(Vector.Zero, 0);
    }
}

export default Forces;
