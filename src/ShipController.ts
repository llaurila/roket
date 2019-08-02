import Keys from "./Controls/Keys";
import Ship from "./Ship";

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
        this.ship.engineLeft.burning = cw();
        this.ship.engineRight.burning = ccw();
    
        if (!this.ship.engineLeft.burning && !this.ship.engineRight.burning && burning())
        {
            this.ship.engineLeft.burning = true;
            this.ship.engineRight.burning = true;
        }
    }
}

const burning = () => Keys.isDown(UP);
const ccw = () => Keys.isDown(LEFT);
const cw = () => Keys.isDown(RIGHT);

export default ShipController;