import Level from "../Level";
import Cosmos from "../components/Cosmos";
import ShipController from "../ShipController";
import Objective from "../Level/Objective";

const LOW_SPEED_THRESHOLD = 10;
const HIGH_SPEED_THRESHOLD = 100;

class VelocityControl extends Level {
    public name = "LEVEL 2: VELOCITY CONTROL";
    public description =
        "ACCELERATE TO GREAT SPEEDS, TURN AROUND AND DECELERATE BACK TO FULL STOP.";

    public createObjects(): void {
        this.graphics.add(new Cosmos());
        this.ship.fuelTank.currentAmount = 100;
        this.shipController = new ShipController(this.ship);
    }

    public createObjectives() {
        this.addOrderedObjectives([
            new Objective(
                "ACCELERATE TO 100 M/S",
                () => this.ship.v.length() >= HIGH_SPEED_THRESHOLD
            ),
            new Objective(
                "DECELERATE BACK TO LESS THAN 10 M/S",
                () => this.ship.v.length() < LOW_SPEED_THRESHOLD
            )
        ]);
    }
}

export default VelocityControl;
