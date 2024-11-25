type ObjectiveText = string | (() => string);

export enum ObjectiveState {
    None,
    Success,
    Failure
}

class Objective {
    private state: ObjectiveState = ObjectiveState.None;
    private message: string|null = null;

    private dependsOn: Objective[] = [];

    public constructor(
        public text: ObjectiveText,
        private testForSuccess: () => boolean,
        private testForFailure: () => string|null = () => null
    ) {}

    public test(): ObjectiveState {
        if (this.state != ObjectiveState.None) return this.state;

        const failureMessage = this.testForFailure();
        if (failureMessage != null) {
            this.message = failureMessage;
            return this.state = ObjectiveState.Failure;
        }

        if (this.testForSuccessWithDependencies()) {
            return this.state = ObjectiveState.Success;
        }

        return ObjectiveState.None;
    }

    public getState = (): ObjectiveState => this.state;

    public getMessage = (): string|null => this.message;

    public addDependency(objective: Objective): void {
        this.dependsOn.push(objective);
    }

    private testForSuccessWithDependencies(): boolean {
        if (this.dependsOn.every((objective) => objective.state == ObjectiveState.Success)) {
            if (this.testForSuccess()) {
                return true;
            }
        }
        return false;
    }
}

export default Objective;
