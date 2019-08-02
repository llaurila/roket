import Vector from "./Vector";

interface IEnvironment {
    G: Vector;
} 

const VacuumOfSpace: IEnvironment = {
    G: Vector.Zero
};

const Moon: IEnvironment = {
    G: Vector.Up.mul(-1.62)
};

const Default = VacuumOfSpace;

export {
    IEnvironment,
    VacuumOfSpace,
    Moon,
    Default
};