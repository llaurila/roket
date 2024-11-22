 
import Level from "../../Level";
import Cosmos from "../../Cosmos";
import ShipController from "../../ShipController";
import Objective from "../../Objective";
import Ship from "../../Ship";
import RNG from "../../RNG";
import { Config } from "../../config";
import LevelConfig from "./config";
import { generateFuelCapsule } from "./fuel";
import NPC_AI from "./NPC_AI";

class GameOfTag extends Level {
    name = "LEVEL 4: GAME OF TAG";
    description = "CATCH THE OTHER SHIP.";

    rng: RNG = new RNG(LevelConfig.RAND_SEED);
    enemy: Ship = new Ship(LevelConfig.OTHER_SHIP_OFFSET);
    ai?: NPC_AI;
    
    started = false;
    caught = false;

    createObjects(): void {
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

        this.ai = new NPC_AI(this.ship, this.enemy);

        this.generateNewFuelCapsule();
    }

    generateNewFuelCapsule() {
        const fuel = generateFuelCapsule(this);

        fuel.onCollision(e => {
            if (!fuel.collected && e.target == this.ship) {
                this.generateNewFuelCapsule();
            }
        });

        this.addFuelCapsule(fuel);
    }

    createObjectives() {
        this.objectives.push(new Objective(
            "CATCH THE OTHER SHIP.",
            () => this.caught
        ));
    }

    update(time: number, delta: number) {
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
