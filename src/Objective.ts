class Objective {
    text: string;
    cleared = false;
    check: () => boolean;

    constructor(text: string, check: () => boolean) {
        this.text = text;
        this.check = check;
    }
}

export default Objective;
