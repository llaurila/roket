import { getDistanceFormat } from "./Utils";

export const DEFAULT_TABLE_ROW_LABEL_WIDTH = 25;
export const DEFAULT_TABLE_ROW_VALUE_WIDTH = 10;

const SECONDS_PER_HOUR = 3600;
const SECONDS_PER_MINUTE = 60;

export function formatTime(seconds: number): string {
    const hours = Math.floor(seconds / SECONDS_PER_HOUR);
    const minutes = Math.floor((seconds % SECONDS_PER_HOUR) / SECONDS_PER_MINUTE);
    const remainingSeconds = Math.floor(seconds % SECONDS_PER_MINUTE);
    const fHours = hours.toString().padStart(2, "0");
    const fMinutes = minutes.toString().padStart(2, "0");
    const fSeconds = remainingSeconds.toString().padStart(2, "0");
    return `${fHours}:${fMinutes}:${fSeconds}`;
}

export function getDeltaTimeFormatted(t: number): string {
    const SECS_PER_MIN = 60;

    const s = Math.floor(t);
    const m = Math.floor(s / SECS_PER_MIN);

    return `T+${m}:${String(s % SECS_PER_MIN).padStart(2, "0")}`;
}

export function formatDistance(n: number): string {
    const fmt = getDistanceFormat(n);
    return fmt.value + " " + fmt.unit;
}

export function getTableRows(
    data: [string, string, string][],
    labelWidth: number,
    valueWidth: number): string
{
    return data.map(
        ([label, value, unit]) => getTableRow(label, value, unit, labelWidth, valueWidth))
            .join("\n");
}

export function getTableRow(
    label: string,
    value: string,
    unit = "",
    labelWidth = DEFAULT_TABLE_ROW_LABEL_WIDTH,
    valueWidth = DEFAULT_TABLE_ROW_VALUE_WIDTH
): string {
    return label.padEnd(labelWidth) + value.padStart(valueWidth) + " " + unit;
}
