import Level from "../Level";
import Cosmos from "../Cosmos";
import ShipController from "../ShipController";
import Objective from "../Objective";

class Introduction extends Level {
    name: string = "Level 2: Velocity Control";
    description: string =
`Accelerate to great speeds, turn around and decelerate back to full stop.`;

    createObjects(): void {
        this.graphics.add(new Cosmos());
        this.shipController = new ShipController(this.ship);
    }

    createObjectives() {
        let greatSpeed = new Objective(
            "Accelerate to 100 m/s.",
            () => this.ship.v.length() >= 100);
        this.objectives.push(greatSpeed);

        this.objectives.push(new Objective(
            "Decelerate back to less than 10 m/s.",
            () => greatSpeed.cleared && this.ship.v.length() < 10
        ));
    }
}

export default Introduction;