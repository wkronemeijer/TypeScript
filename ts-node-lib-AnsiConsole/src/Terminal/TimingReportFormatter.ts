import {humanizeDuration, panic, StringBuilder} from "@wkronemeijer/system";

export interface TimingReport {
    readonly label: string;
    readonly start: number;
    readonly end: number;
}

export function TimingReport_toString(
    {label, start, end}: TimingReport,
): string {
    if (!(0 <= start && start <= end)) {panic("range error")} 
    
    const timeDelta = end - start;
    const duration = timeDelta >= 0.5 ? `${timeDelta}ms` : `<1ms`;
    const humanDuration = humanizeDuration(timeDelta);
    
    const result = new StringBuilder;
    result.append(label);
    result.append(" in ");
    result.append(duration);
    if (duration !== humanDuration) {
        result.append(" (≈ ");
        result.append(humanDuration);
        result.append(")");
    }
    result.append(".");
    
    return result.toString();
}
