import Vector from "./Physics/Vector";

export interface IRelativeProps {
    position: Vector;
    rotation: number;
}

export type Action = () => void;

export interface IRecurringTask {
    interval: number;
    func: Action;
    prevRun: number;
}
