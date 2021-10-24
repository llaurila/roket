import Vector from "./Vector";

const MOON_G = 1.62;

interface IEnvironment {
    G: Vector;
}

const VacuumOfSpace: IEnvironment = {
    G: Vector.Zero
};

const Moon: IEnvironment = {
    G: Vector.Up.mul(-MOON_G)
};

const Default = VacuumOfSpace;

export {
    IEnvironment,
    VacuumOfSpace,
    Moon,
    Default
};
