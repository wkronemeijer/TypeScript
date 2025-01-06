/** Humanize a percentage, such that it fits in 4 characters. So */
export function humanizePercentage(percentage: number, fractionDigits: number = 0): string {
    return `${(percentage * 100).toFixed(fractionDigits)}%`;
}
