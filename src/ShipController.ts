import Keys from "./Controls/Keys";
import Ship from "./Ship";
import GameController from "./Controls/GameController";

const
    PAD_UP_DOWN = 1,
    PAD_LEFT_RIGHT = 0;

class ShipController {
    ship: Ship;

    constructor(ship: Ship) {
        this.ship = ship;
    }

    control() {
        this.handleAnalog();

        if (cw()) {
            this.ship.engineLeft.burning = true;
        }

        if (ccw()) {
            this.ship.engineRight.burning = true;
        }

        this.ship.engineRight.burning = ccw();

        if (!this.ship.engineLeft.burning && !this.ship.engineRight.burning && burning())
        {
            this.ship.engineLeft.burning = true;
            this.ship.engineRight.burning = true;
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

const burning = () => Keys.isDown("ArrowUp");
const ccw = () => Keys.isDown("ArrowLeft");
const cw = () => Keys.isDown("ArrowRight");

export default ShipController;
