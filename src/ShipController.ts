import Keys from "./Controls/Keys";
import Ship from "./Ship";
import GameController from "./Controls/GameController";

const
    UP = 38,
    LEFT = 37,
    RIGHT = 39;

class ShipController {
    ship: Ship;

    constructor(ship: Ship) {
        this.ship = ship;
    }

    control() {
        if (GameController.controllerAvailable()) {
            const boost = Math.round(Math.max(0, Number(GameController.getAxis(1)) * -1) * 100) / 100;
            const lr = GameController.getAxis(0);
            this.ship.engineLeft.setThrottle(Math.max(Math.max(0, lr), boost));
            this.ship.engineRight.setThrottle(Math.max(Math.max(0, -lr), boost));
        }
        else {
            this.ship.engineLeft.burning = cw();
            this.ship.engineRight.burning = ccw();
        
            if (!this.ship.engineLeft.burning && !this.ship.engineRight.burning && burning())
            {
                this.ship.engineLeft.burning = true;
                this.ship.engineRight.burning = true;
            }
        }
    }
}

const burning = () => Keys.isDown(UP);
const ccw = () => Keys.isDown(LEFT);
const cw = () => Keys.isDown(RIGHT);

export default ShipController;