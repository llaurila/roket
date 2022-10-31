import Level from "../Level";
import Cosmos from "../Cosmos";
import ShipController from "../ShipController";
import Objective from "../Objective";

class VelocityControl extends Level {
    name = "LEVEL 2: VELOCITY CONTROL";
    description =
        "ACCELERATE TO GREAT SPEEDS, TURN AROUND AND DECELERATE BACK TO FULL STOP.";

    createObjects(): void {
        this.graphics.add(new Cosmos());
        this.shipController = new ShipController(this.ship);
    }

    createObjectives() {
        const greatSpeed = new Objective(
            "ACCELERATE TO 100 M/S",
            () => this.ship.v.length() >= 100);
        this.objectives.push(greatSpeed);

        this.objectives.push(new Objective(
            "DECELERATE BACK TO LESS THAN 10 M/S",
            () => greatSpeed.cleared && this.ship.v.length() < 10
        ));
    }
}

export default VelocityControl;
