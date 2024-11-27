import Level from ".";
import Cosmos from "@/components/Cosmos";
import type { GameObject, LevelData } from "./types";
import Objective from "./Objective";
import type Body from "@/Physics/Body";
import Fuel from "@/Fuel";
import Vector from "@/Physics/Vector";
import ShipController from "@/ShipController";

type SuccessCheck = () => boolean;

const FUEL_DEFAULT_ANGULAR_VELOCITY = .21;

abstract class DataLevel extends Level {
    private objects: Record<string, Body> = {};
    private successChecks: Record<string, SuccessCheck> = {};

    public constructor(private data: LevelData) {
        super();
    }

    public get name(): string {
        return this.data.name;
    }

    public get description(): string {
        return this.data.description;
    }

    public createObjects(): void {
        this.setCosmos();
        this.setShipProperties();
        this.createDynamicObjects();
        this.shipController = new ShipController(this.ship);
    }

    public createObjectives(): void {
        this.registerObjectiveChecks();

        for (const o of this.data.objectives) {
            this.objectives.push(new Objective(
                o.title,
                this.successChecks[o.successCheck]
            ));
        }
    }

    protected registerSuccessCheck(id: string, check: SuccessCheck): void {
        this.successChecks[id] = check;
    }

    protected hasCosmos(): boolean {
        if (this.data.cosmos == undefined) return true;
        return this.data.cosmos;
    }

    protected getObject<T>(id: string): T {
        return this.objects[id] as T;
    }

    private createDynamicObjects(): void {
        for (const o of this.data.objects) {
            switch (o.type) {
                case "fuel":
                    this.createFuel(o);
                    break;
            }
        }
    }

    private createFuel(o: GameObject) {
        const fuel = new Fuel(Vector.fromCoords(o.position));
        fuel.angularVelocity = o.angularVelocity || FUEL_DEFAULT_ANGULAR_VELOCITY;
        this.objects[o.id] = fuel;
        this.addFuelCapsule(fuel);
    }

    private setCosmos(): void {
        if (this.hasCosmos()) {
            this.graphics.add(new Cosmos());
        }
    }

    private setShipProperties(): void {
        this.ship.fuelTank.currentAmount = this.data.ship.fuelTank.currentAmount;
    }

    protected abstract registerObjectiveChecks(): void;
}

export default DataLevel;
