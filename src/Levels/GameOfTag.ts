import Level from "../Level";
import Cosmos from "../Cosmos";
import ShipController from "../ShipController";
import Objective from "../Objective";
import Ship from "../Ship";
import Vector from "../Physics/Vector";
import Fuel from "../Fuel";
import RNG from "../RNG";
import { Config } from "../config";

const RAND_SEED = 89321;
const OTHER_SHIP_DISTANCE = 40;
const FUEL_CAPSULE_DISTANCE_MIN = 50;
const FUEL_CAPSULE_DISTANCE_MAX = 200;
const CORRECT_HEADING_TOLERANCE = 0.15;

class GameOfTag extends Level {
    name = "Level 4: Game of Tag";
    description =
        "Catch the other ship.";

    otherShip: Ship = new Ship(Vector.Up.mul(OTHER_SHIP_DISTANCE));
    caught = false;
    rng: RNG = new RNG(RAND_SEED);

    createObjects(): void {
        this.graphics.add(new Cosmos());
        this.shipController = new ShipController(this.ship);

        this.physics.add(this.otherShip);
        this.graphics.add(this.otherShip);

        this.otherShip.color = { R: 1, G: 0, B: 1, A: 1 };

        this.otherShip.mass = Config.ship.mass;
        this.otherShip.rotation = 2;

        this.otherShip.onCollision(e => {
            if (!this.caught && e.target == this.ship) {
                this.caught = true;
                this.otherShip.die();
            }
        });

        this.otherShip.engineLeft.setThrottle(1);
        this.otherShip.engineRight.setThrottle(1);

        this.generateNewFuelCapsule();
    }

    generateNewFuelCapsule() {
        const fuel = new Fuel(
            this.ship.pos.add(
                Vector.Up.rotate(this.rng.next(0, Math.PI * 2))
                    .mul(this.rng.next(
                        FUEL_CAPSULE_DISTANCE_MIN, FUEL_CAPSULE_DISTANCE_MAX))
            )
        );

        fuel.onCollision(e => {
            if (!fuel.collected && e.target == this.ship) {
                this.generateNewFuelCapsule();
            }
        });

        this.addFuelCapsule(fuel);
    }

    createObjectives() {
        this.objectives.push(new Objective(
            "Catch the other ship.",
            () => this.caught
        ));
    }

    update(time: number, delta: number) {
        super.update(time, delta);

        if (time > 2) {
            const target = this.ship.pos.add(this.ship.v.neg());
            const toTarget = target.sub(this.otherShip.pos).normalize();
            const turn = this.otherShip.getHeading().cross(toTarget);

            this.otherShip.engineLeft.setThrottle(0);
            this.otherShip.engineRight.setThrottle(0);

            if (Math.abs(this.otherShip.angularVelocity) > 0.5) {
                if (this.otherShip.angularVelocity >= 0) {
                    this.otherShip.engineLeft.setThrottle(
                        Math.min(this.otherShip.angularVelocity, 1)
                    );
                } else {
                    this.otherShip.engineRight.setThrottle(
                        Math.min(-this.otherShip.angularVelocity, 1)
                    );
                }
            }
            else {
                if (Math.abs(turn) < CORRECT_HEADING_TOLERANCE) {
                    this.otherShip.engineLeft.setThrottle(1);
                    this.otherShip.engineRight.setThrottle(1);
                }
                else if (turn >= 0) {
                    this.otherShip.engineRight.setThrottle(turn);
                } else {
                    this.otherShip.engineLeft.setThrottle(-turn);
                }
            }
        }
    }
}

export default GameOfTag;
