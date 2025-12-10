import Vector from "@/Physics/Vector";

export interface IShip {
    pos: Vector;
    v: Vector;
    getHeading(): Vector;
}
