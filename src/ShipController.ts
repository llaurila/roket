import Keys from "./Controls/Keys";
import type Ship from "./Ship";
import GameController from "./Controls/GameController";
import { Config } from "./config";

const
    PAD_UP_DOWN = 1,
    PAD_LEFT_RIGHT = 0;

type ThrustPowerFunc = () => number;

class ShipController {
    public ship: Ship;

    public constructor(ship: Ship) {
        this.ship = ship;
    }

    public control() {
        this.handleAnalog();

        this.handleLeft();
        this.handleRight();

        if (this.bothOff() && both())
        {
            this.ship.engineLeft.burning = true;
            this.ship.engineRight.burning = true;
        }

        const chokeValue = choke() ? Config.ship.engineChokeModeMultiplier : 1;
        this.ship.engineLeft.setChoke(chokeValue);
        this.ship.engineRight.setChoke(chokeValue);

        this.handleWeapons();
    }

    private handleLeft = () => { if (cw()) this.ship.engineLeft.burning = true; };
    private handleRight = () => { if (ccw()) this.ship.engineRight.burning = true; };

    private bothOff = () => !this.ship.engineLeft.burning && !this.ship.engineRight.burning;

    private handleWeapons() {
        const triggerDown = fire();
        for (const weapon of this.ship.weapons) {
            weapon.setTriggerDown(triggerDown);
        }
    }

    private handleAnalog() {
        if (GameController.controllerAvailable()) {
            const forward = Math.round(
                Math.max(0, Number(GameController.getAxis(PAD_UP_DOWN)) * -1) * 100
            ) / 100;
            const turn = GameController.getAxis(PAD_LEFT_RIGHT);
            this.ship.engineLeft.setThrottle(Math.max(Math.max(0, turn), forward));
            this.ship.engineRight.setThrottle(Math.max(Math.max(0, -turn), forward));
        }
        else {
            this.ship.engineLeft.burning = false;
            this.ship.engineRight.burning = false;
        }
    }
}

const choke = () => Keys.isDown("Shift");
const both = () => Keys.isDown("ArrowUp");
const ccw: ThrustPowerFunc = () => Keys.isDown("ArrowLeft") ? 1 : 0;
const cw: ThrustPowerFunc = () => Keys.isDown("ArrowRight") ? 1 : 0;
const fire = () => Keys.isDown(" ") || Keys.isDown("Space") || Keys.isDown("Spacebar");

export default ShipController;
