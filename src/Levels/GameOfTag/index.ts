
import Level from "../../Level";
import Cosmos from "../../Cosmos";
import ShipController from "../../ShipController";
import Objective from "../../Objective";
import Ship from "../../Ship";
import RNG from "../../RNG";
import { Config } from "../../config";
import LevelConfig from "./config";
import { generateFuelCapsule } from "./fuel";
import NPCAI from "./NPCAI";

class GameOfTag extends Level {
    public name = "LEVEL 5: GAME OF TAG";
    public description = "CATCH THE OTHER SHIP.";

    public rng: RNG = new RNG(LevelConfig.RAND_SEED);
    public enemy: Ship = new Ship(LevelConfig.OTHER_SHIP_OFFSET);
    public ai?: NPCAI;

    public started = false;
    public caught = false;

    public createObjects(): void {
        this.graphics.add(new Cosmos());
        this.shipController = new ShipController(this.ship);

        this.physics.add(this.enemy);
        this.graphics.add(this.enemy);

        this.enemy.color = { R: 1, G: 0, B: 1, A: 1 };

        this.enemy.mass = Config.ship.mass;
        this.enemy.rotation = 2;

        this.enemy.onCollision(e => {
            if (!this.caught && e.target == this.ship) {
                this.caught = true;
                this.enemy.die();
            }
        });

        this.ai = new NPCAI(this.ship, this.enemy);

        this.generateNewFuelCapsule();
    }

    public generateNewFuelCapsule() {
        const fuel = generateFuelCapsule(this);

        fuel.onCollision(e => {
            if (!fuel.collected && e.target == this.ship) {
                this.generateNewFuelCapsule();
            }
        });

        this.addFuelCapsule(fuel);
    }

    public createObjectives() {
        this.objectives.push(new Objective(
            "CATCH THE OTHER SHIP.",
            () => this.caught
        ));
    }

    public update(time: number, delta: number) {
        super.update(time, delta);

        if (this.started) {
            this.ai?.think();
        }
        else {
            this.startNpcWhenPlayerMoves();
        }
    }

    private startNpcWhenPlayerMoves() {
        const INITIAL_SPEED = 10;

        if (this.ship.v.length() > 0) {
            this.enemy.v = this.enemy.getHeading().mul(INITIAL_SPEED);
            this.started = true;
        }
    }
}

export default GameOfTag;
