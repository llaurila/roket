import Vector from "./Vector";

const MOON_G = 1.62;

export interface IEnvironment {
    G: Vector;
}

export const VacuumOfSpace: IEnvironment = {
    G: Vector.Zero
};

export const Moon: IEnvironment = {
    G: Vector.Up.mul(-MOON_G)
};

export const Default = VacuumOfSpace;
