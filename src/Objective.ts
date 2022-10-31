type ObjecttiveText = string | (() => string);

class Objective {
    cleared = false;

    constructor(
        public text: ObjecttiveText,
        public check: () => boolean
    ) {}
}

export default Objective;
