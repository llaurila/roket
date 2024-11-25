import { Config } from "../config";
import type { IColor } from "../Graphics/Color";
import { getColorString, getGray } from "../Graphics/Color";
import type Objective from "../Objective";
import { ObjectiveState } from "../Objective";

const config = Config.ui;

const RELATIVE_MARGIN = 3;
const LINE_START_X = config.window.margin * RELATIVE_MARGIN;
const LINE_END_X = config.missionControl.windowWidth - config.window.margin;
const LINE_LENGTH = LINE_END_X - LINE_START_X;

enum TextAlign {
    Left,
    Right,
    Center
}

export default class UIDrawer {
    private ctx: CanvasRenderingContext2D;
    private lineNumber = 0;

    public constructor(ctx: CanvasRenderingContext2D) {
        ctx.font = `${config.missionControl.fontSize}px ${Config.typography.fontFamily}`;
        ctx.textBaseline = "top";

        this.ctx = ctx;
    }

    public drawTitle(text: string): void {
        const LINE_HEIGHT = 1.25;

        this.lineNumber += 1;

        this.ctx.fillStyle =  getColorString(getGray(1));
        this.drawText(text, this.lineNumber);

        const x = LINE_START_X;
        const y = getLineY(this.lineNumber) + config.missionControl.lineHeight * LINE_HEIGHT;

        this.ctx.strokeStyle = getColorString(Config.typography.emphasisColor);
        this.ctx.beginPath();
        this.ctx.moveTo(x, y);
        this.ctx.lineTo(LINE_END_X, y);
        this.ctx.stroke();

        this.lineNumber += 2;
    }

    public drawNumericField(
        label: string,
        value: string
    ): void
    {
        const ALPHA = .6;

        this.ctx.fillStyle = getColorString(getGray(1, ALPHA));
        this.drawText(label, this.lineNumber);

        this.ctx.fillStyle = getColorString(getGray(1));
        this.drawText(value, this.lineNumber, TextAlign.Right);

        this.lineNumber += 1;
    }

    public drawObjective(objective: Objective) {
        const MARGIN_TOP = 4;

        const y = getLineY(this.lineNumber) - MARGIN_TOP;
        this.ctx.fillStyle = getColorString(config.control.backgroundColor);
        this.ctx.fillRect(LINE_START_X, y, LINE_LENGTH, config.missionControl.lineHeight + 2);

        this.ctx.fillStyle = getColorString(getObjectiveColor(objective));

        const PADDING_LEFT = 4;
        const text = typeof objective.text == "function" ? objective.text() : objective.text;
        this.drawText(text, this.lineNumber, TextAlign.Left, PADDING_LEFT);

        this.lineNumber += 1.5;
    }

    private drawText(
        text: string,
        lineNumber: number,
        align: TextAlign = TextAlign.Left,
        offsetX = 0
    ): void {
        this.ctx.fillText(
            text,
            this.getLineX(text, align) + offsetX,
            getLineY(lineNumber)
        );
    }

    private getLineX(text: string, align: TextAlign): number {
        const lineXFuncs: Record<TextAlign, LineXFunc> = {
            [TextAlign.Left]:
            () => LINE_START_X,

            [TextAlign.Right]:
            text => LINE_END_X - this.ctx.measureText(text).width,

            [TextAlign.Center]:
            text => LINE_START_X + (LINE_LENGTH - this.ctx.measureText(text).width) / 2
        };
        return lineXFuncs[align](text);
    }
}

type LineXFunc = (text: string) => number;

function getLineY(lineNumber: number): number {
    const cfg = config.window;
    const MARGINS = 4;
    return cfg.titleHeight + cfg.margin * MARGINS + config.missionControl.lineHeight * lineNumber;
}

function getObjectiveColor(objective: Objective): IColor {
    switch (objective.getState()) {
        case ObjectiveState.Success:
            return Config.ui.objectives.successColor;
        case ObjectiveState.Failure:
            return Config.ui.objectives.failureColor;
    }
    return Config.typography.defaultColor;
}
