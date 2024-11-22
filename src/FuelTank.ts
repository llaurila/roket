import { Config } from "./config";

class FuelTank {
    public capacity: number;
    public currentAmount: number;

    public constructor(capacity: number) {
        this.currentAmount = this.capacity = capacity;
    }

    public consume(amount: number): void {
        this.currentAmount = Math.max(0,
            this.currentAmount - amount
        );
    }

    public isEmpty(): boolean {
        return this.currentAmount <= 0;
    }

    public hasFuel(): boolean {
        return this.currentAmount > 0;
    }

    public getMass(): number {
        return this.currentAmount * Config.fuel.mass;
    }
}

export default FuelTank;
