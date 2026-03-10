import type Vector from "@/Physics/Vector";
import type { IWeapon } from "@/Weapons/IWeapon";

export interface IShip {
    pos: Vector;
    v: Vector;
    weapons: IWeapon[];
    getHeading: () => Vector;
}
