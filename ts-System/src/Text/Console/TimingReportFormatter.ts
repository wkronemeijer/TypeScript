import { requires } from "../../Assert";
import { humanizeDuration } from "../Formatting/Duration";
import { StringBuilder } from "../StringBuilder";

export interface TimingReport {
    readonly label: string;
    readonly start: number;
    readonly end: number;
}



export function TimingReport_toString(timingReport: TimingReport): string {
    const { label, start, end } = timingReport;
    
    requires(0 <= start && start <= end);
    
    const timeDelta = end - start;
    const duration = timeDelta >= 0.5 ? `${timeDelta}ms` : `<1ms`;
    const humanDuration = humanizeDuration(timeDelta);
    
    const msg = new StringBuilder();
    // msg.append("'");
    msg.append(label);
    // msg.append("'");
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
