import Level from ".";
import Cosmos from "@/components/Cosmos";
import type { GameObject, LevelData, LevelObjective } from "./types";
import Objective from "./Objective";
import type Body from "@/Physics/Body";
import Fuel from "@/Fuel";
import Vector from "@/Physics/Vector";
import ShipController from "@/ShipController";
import RNG from "@/RNG";
import { formatString } from "@/Utils";
import { Beacon } from "@/Beacon";

const DEFAULT_RAND_SEED = 951337;

type ObjectiveTest = () => boolean;

type FailureCheck = () => string|null;

const FUEL_DEFAULT_ANGULAR_VELOCITY = .21;

abstract class DataLevel extends Level {
    protected rng: RNG;

    private objects: Record<string, Body> = {};
    private objectiveTests: Record<string, ObjectiveTest> = {};

    public constructor(private data: LevelData) {
        super();
        this.rng = this.getRNG();
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

        const objectives: Record<string, Objective> = {};

        for (const o of this.data.objectives) {
            this.createObjective(o, objectives);
        }

        this.buildObjectiveDependencies(objectives);
    }

    protected registerObjectiveTest(id: string, check: ObjectiveTest): void {
        this.objectiveTests[id] = check;
    }

    protected hasCosmos(): boolean {
        if (this.data.cosmos == undefined) return true;
        return this.data.cosmos;
    }

    protected getObject<T>(id: string): T {
        return this.objects[id] as T;
    }

    protected getEnv<T>(key: string): T {
        const value = this.data.variables[key];
        if (value == undefined) {
            throw new Error(`Environment variable ${key} not found`);
        }
        return value as T;
    }

    protected getRuntimeVars(): Record<string, string> {
        return {};
    }

    private getRNG(): RNG {
        return new RNG(this.data.randomSeed || DEFAULT_RAND_SEED);
    }

    private createObjective(o: LevelObjective, objectives: Record<string, Objective>) {
        let externalSuccessCheck: ObjectiveTest | undefined;
        if (o.externalSuccessCheck) {
            externalSuccessCheck = this.objectiveTests[o.externalSuccessCheck];
        }

        const checkFunctions: ObjectiveTest[] = this.getCheckFunctions(o);

        const combinedChecks = () => {
            if (!checkFunctions.every(f => f())) return false;
            if (externalSuccessCheck != undefined && !externalSuccessCheck()) return false;
            return true;
        };

        let externalFailureCheck: FailureCheck | undefined;
        const test = o.externalFailureCheck?.test;

        if (test) {
            externalFailureCheck = () => {
                if (this.objectiveTests[test]()) {
                    return o.externalFailureCheck?.message || "OBJECTIVE FAILED";
                }
                return null;
            };
        }

        const objective = new Objective(
            () => formatString(o.title, this.getRuntimeVars()),
            combinedChecks,
            externalFailureCheck
        );

        objectives[o.id] = objective;

        this.objectives.push(objective);
    }

    private getCheckFunctions(o: LevelObjective) {
        const checkFunctions: ObjectiveTest[] = [];

        for (const successCheck of o.successChecks || []) {
            switch (successCheck.type) {
                case "kill":
                    checkFunctions.push(() => {
                        const target = this.objects[successCheck.target];
                        return target == undefined || !target.alive;
                    });
                    break;

                default:
                    throw new Error(`Unknown success check type: ${successCheck.type}`);
            }
        }

        return checkFunctions;
    }

    private buildObjectiveDependencies(objectives: Record<string, Objective>): void {
        for (const objectiveSpec of this.data.objectives) {
            checkForDependencies(objectiveSpec);
        }

        function checkForDependencies(objectiveSpec: LevelObjective) {
            if (objectiveSpec.dependsOn) {
                const objective = objectives[objectiveSpec.id];
                addDependencies(objectiveSpec.dependsOn, objective);
            }
        }

        function addDependencies(dependsOn: string|string[], objective: Objective) {
            const deps = Array.isArray(dependsOn) ?
                dependsOn : [dependsOn];

            for (const depName of deps) {
                objective.addDependency(objectives[depName]);
            }
        }
    }

    private createDynamicObjects(): void {
        if (!this.data.objects) return;

        type ObjectFactory = (o: GameObject) => void;

        const factories: Record<string, ObjectFactory> = {
            fuel: this.createFuel.bind(this),
            beacon: this.createBeacon.bind(this)
        };

        for (const o of this.data.objects) {
            const factory = factories[o.type];
            if (factory) {
                factory(o);
            }
        }
    }

    private createFuel(o: GameObject) {
        const fuel = new Fuel(Vector.fromComponents(o.position));

        if (o.props?.amount) {
            fuel.amount = o.props.amount as number;
        }

        fuel.angularVelocity = o.angularVelocity || FUEL_DEFAULT_ANGULAR_VELOCITY;
        this.objects[o.id] = fuel;
        this.addFuelCapsule(fuel);
    }

    private createBeacon(o: GameObject) {
        const beacon = new Beacon(Vector.fromComponents(o.position));
        this.objects[o.id] = beacon;
        this.addBeacon(beacon);
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
