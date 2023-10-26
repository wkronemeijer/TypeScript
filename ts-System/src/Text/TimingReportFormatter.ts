import { humanizeDuration } from "./Formatting/Duration";
import { StringBuilder } from "./StringBuilder";
import { requires } from "../Assert";

export interface TimingReport {
    readonly label: string;
    readonly start: number;
    readonly end: number;
}

export function TimingReport_toString(self: TimingReport): string {
    const { label, start, end } = self;
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
