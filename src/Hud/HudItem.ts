export type EnabledSolver = () => boolean;

export const AlwaysEnabled: EnabledSolver = () => true;

export class HudItem {
    getText: () => string;
    enabled: EnabledSolver;

    constructor(getText: () => string, enabled: EnabledSolver = AlwaysEnabled) {
        this.getText = getText;
        this.enabled = enabled;
    }
}
