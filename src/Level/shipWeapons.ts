import type Ship from "@/Ship";
import type { IWeapon } from "@/Weapons/IWeapon";
import { Laser } from "@/Weapons/Laser";
import type { ShipWeaponType } from "./types";

export function createShipWeapons(ship: Ship, weaponTypes: ShipWeaponType[]): IWeapon[] {
    return weaponTypes.map(type => createWeapon(type, ship));
}

function createWeapon(type: ShipWeaponType, ship: Ship): IWeapon {
    switch (type) {
        case "laser":
            return new Laser(ship);

        default:
            throw new Error("Unknown ship weapon type.");
    }
}
