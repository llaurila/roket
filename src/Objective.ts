type ObjectiveText = string | (() => string);

class Objective {
    public cleared = false;

    public constructor(
        public text: ObjectiveText,
        public check: () => boolean
    ) {}
}

export default Objective;
