import Level from "../Level";
import Cosmos from "../Cosmos";
import ShipController from "../ShipController";
import Objective from "../Objective";

const LOW_SPEED_THRESHOLD = 10;
const HIGH_SPEED_THRESHOLD = 100;

class VelocityControl extends Level {
    public name = "LEVEL 2: VELOCITY CONTROL";
    public description =
        "ACCELERATE TO GREAT SPEEDS, TURN AROUND AND DECELERATE BACK TO FULL STOP.";

    public createObjects(): void {
        this.graphics.add(new Cosmos());
        this.shipController = new ShipController(this.ship);
    }

    public createObjectives() {
        const greatSpeed = new Objective(
            "ACCELERATE TO 100 M/S",
            () => this.ship.v.length() >= HIGH_SPEED_THRESHOLD);
        this.objectives.push(greatSpeed);

        this.objectives.push(new Objective(
            "DECELERATE BACK TO LESS THAN 10 M/S",
            () => greatSpeed.cleared && this.ship.v.length() < LOW_SPEED_THRESHOLD
        ));
    }
}

export default VelocityControl;
