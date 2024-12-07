import { Config } from "@/config";
import { getGrayHex } from "@/Graphics/Color";
import Shapes from "@/Graphics/Shapes";
import type { Viewport } from "@/Graphics/Viewport";
import Vector from "@/Physics/Vector";
import { formatDistance } from "@/text";

const config = Config.radar;

const TRIANGLE_SHAPE = Shapes.Triangle.rotate(Math.PI);

export class RadarDrawer {
    private pos: Vector;
    private center: Vector;
    private size: number;

    public constructor(private viewport: Viewport, pos: Vector) {
        this.pos = pos;
        this.center = viewport.getCenter();

        this.size = Math.min(
            viewport.width,
            viewport.height
        ) / 2 - config.margin;
    }

    public drawCircle() {
        const { center, size } = this;
        const { ctx } = this.viewport;

        ctx.strokeStyle = getGrayHex(1, config.circleOpacity);
        ctx.beginPath();
        ctx.arc(center.x, center.y, size, 0, 2 * Math.PI);
        ctx.stroke();
    }

    public drawDot(to: Vector, color: string) {
        const { center, size } = this;
        const { ctx } = this.viewport;

        const screenDistanceToTarget =
            this.viewport.toScreenCoordinates(to)
                .sub(this.center).length();

        if (screenDistanceToTarget > this.size) {
            const toTarget = to.sub(this.pos);
            const direction = toTarget.normalize();

            const getPosFromCenter = (distance: number) =>
                center.add(flipY(direction.mul(distance)));

            const dotPos = getPosFromCenter(size);

            ctx.fillStyle = color;
            ctx.beginPath();
            ctx.arc(dotPos.x, dotPos.y, config.dotRadius, 0, 2 * Math.PI);
            ctx.fill();

            const labelPos = getPosFromCenter(size - config.labelOffset);

            ctx.font = `${config.fontSize}px ${Config.typography.fontFamily}`;
            ctx.textBaseline = "middle";
            ctx.textAlign = "center";

            ctx.fillText(formatDistance(toTarget.length()), labelPos.x, labelPos.y);
        }
    }

    public drawCircleMarker(to: Vector, radius: number, color: string) {
        this.drawMarker(to, markerPos => {
            const { ctx } = this.viewport;
            ctx.strokeStyle = color;
            ctx.beginPath();
            ctx.arc(markerPos.x, markerPos.y, radius, 0, 2 * Math.PI);
            ctx.stroke();
        });
    }

    public drawTriangleMarker(to: Vector, radius: number, color: string) {
        const SCALE = 0.3;
        const OFFSET = 4.5;
        const OFFSET_V = new Vector(OFFSET, 0);

        this.drawMarker(to, (markerPos, theta) => {
            const { ctx } = this.viewport;
            ctx.strokeStyle = color;

            TRIANGLE_SHAPE
                .translate(OFFSET_V)
                .mul(radius * SCALE)
                .rotate(theta)
                .translate(markerPos)
                .makeClosedPath(ctx);

            ctx.stroke();
        });
    }

    private drawMarker(to: Vector, drawFunc: (markerPos: Vector, theta: number) => void) {
        const { center, size } = this;
        const markerPos = center.add(flipY(to.mul(size)));
        const theta = Math.atan2(markerPos.y - center.y, markerPos.x - center.x);
        drawFunc(markerPos, theta);
    }
}

const flipY = (v: Vector) => new Vector(v.x, -v.y);
