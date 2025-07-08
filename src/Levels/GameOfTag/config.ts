import Vector from "../../Physics/Vector";

/* eslint-disable no-magic-numbers */
const config = {
    RAND_SEED: 89321,
    OTHER_SHIP_OFFSET: new Vector(-20, 60),
    FUEL_CAPSULE_DISTANCE_MIN: 50,
    FUEL_CAPSULE_DISTANCE_MAX: 200,
    CORRECT_HEADING_TOLERANCE: 0.15,
    MAX_DISTANCE_FROM_PLAYER: 120,
    MAX_SPEED: 30,
};
/* eslint-enable no-magic-numbers */

export default config;
