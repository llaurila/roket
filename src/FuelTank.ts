const FUEL_MASS = 0.75;

class FuelTank {
    capacity: number;
    currentAmount: number;

    constructor(capacity: number) {
        this.currentAmount = this.capacity = capacity;
    }

    consume(amount: number): void {
        this.currentAmount = Math.max(0,
            this.currentAmount - amount
        );
    }

    isEmpty(): boolean {
        return this.currentAmount <= 0;
    }

    hasFuel(): boolean {
        return this.currentAmount > 0;
    }

    getMass(): number {
        return this.currentAmount * FUEL_MASS;
    }
}

export default FuelTank;