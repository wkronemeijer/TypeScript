import {humanizeDuration} from "../Core/Data/Textual/Formatting/Duration";
import {StringBuilder} from "../Core/Data/Textual/StringBuilder";
import {requires} from "../Core/Errors/Assert";

export interface TimingReport {
    readonly label: string;
    readonly start: number;
    readonly end: number;
}

export function TimingReport_toString(
    {label, start, end}: TimingReport,
): string {
    requires(0 <= start && start <= end, "range error");
    
    const timeDelta = end - start;
    const duration = timeDelta >= 0.5 ? `${timeDelta}ms` : `<1ms`;
    const humanDuration = humanizeDuration(timeDelta);
    
    const msg = new StringBuilder();
    msg.append(label);
    msg.append(" in ");
    msg.append(duration);
    if (duration !== humanDuration) {
        msg.append(" (≈ ");
        msg.append(humanDuration);
        msg.append(")");
    }
    msg.append(".");
    
    return msg.toString();
}
