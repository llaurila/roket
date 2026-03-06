import type Body from "./Body";
import type Vector from "./Vector";

interface IForceField {
    getForceFor: (body: Body) => Vector;
}

export default IForceField;