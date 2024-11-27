import data from "./level.yaml";
import DataLevel from "@/Level/DataLevel";
import type { LevelData } from "@/Level/types";

class Introduction extends DataLevel {
    public constructor() {
        super(data as LevelData);
    }

    /* eslint-disable-next-line @typescript-eslint/no-empty-function */
    protected registerObjectiveChecks(): void {}
}

export default Introduction;
