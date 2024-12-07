import type Vector from "@/Physics/Vector";
import type { Viewport } from "./Viewport";

export class DrawContext {
    public constructor(
        public viewport: Viewport,
        public pos: Vector,
        public rotation = 0
    ) {}
}
