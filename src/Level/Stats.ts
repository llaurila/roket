import {
    DEFAULT_TABLE_ROW_LABEL_WIDTH,
    DEFAULT_TABLE_ROW_VALUE_WIDTH,
    getTableRows
} from "../text";
import { getDistanceFormat } from "../Utils";

export class Stats {
    public velocity = 0;
    public angularVelocity = 0;
    public distanceFromBeacon = 0;
    public distance = 0;
    public fuelConsumption = 0;

    public integrate(other: Stats) {
        this.velocity = Math.max(this.velocity, other.velocity);
        this.angularVelocity = Math.max(this.angularVelocity, other.angularVelocity);
        this.distanceFromBeacon = Math.max(
            this.distanceFromBeacon,
            other.distanceFromBeacon
        );
        this.distance += other.distance;
        this.fuelConsumption += other.fuelConsumption;
    }

    public toString(
        labelWidth = DEFAULT_TABLE_ROW_LABEL_WIDTH,
        valueWidth = DEFAULT_TABLE_ROW_VALUE_WIDTH
    ): string {
        const beacon = getDistanceFormat(this.distanceFromBeacon);
        const distance = getDistanceFormat(this.distance);

        return getTableRows([
            ["MAX VELOCITY", this.velocity.toFixed(), "M/S"],
            ["MAX SPIN", this.angularVelocity.toFixed(1), "RAD/S"],
            ["MAX DISTANCE FROM BEACON", beacon.value, beacon.unit],
            ["TOTAL DISTANCE", distance.value, distance.unit],
            ["TOTAL FUEL CONSUMPTION", this.fuelConsumption.toFixed(1), "L"]
        ], labelWidth, valueWidth);
    }
}
