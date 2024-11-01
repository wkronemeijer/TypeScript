import {Array_sorted, Case, collect, ComparableObject, compare, isInteger, NewtypeChecker, Ordering, UnionMatcher} from "@wkronemeijer/system";
import {AbsoluteTime, AbsoluteTime_toMilliSeconds} from "./Symbolic";

function checkRange(min: number, max: number): (x: number) => boolean {
    return x => min <= x && x <= max;
}

export type  MidiChannel = ReturnType<typeof MidiChannel>;
export const MidiChannel = NewtypeChecker("MidiChannel", {
    constrain: isInteger,
    isValid: checkRange(0, 15),
});

export type  MidiPitch = ReturnType<typeof MidiPitch>;
export const MidiPitch = NewtypeChecker("MidiPitch", {
    constrain: isInteger,
    isValid: checkRange(0, 127),
});

export const MidiPitch_C4 = MidiPitch(60);
export const MidiPitch_A4 = MidiPitch(69); // == 440Hz

export type  MidiVelocity = ReturnType<typeof MidiVelocity>;
export const MidiVelocity = NewtypeChecker("MidiVelocity", {
    constrain: isInteger,
    isValid: checkRange(0, 127),
});

export const MidiVelocity_Default = MidiVelocity(64);

///////////////
// MidiEvent //
///////////////

export type MidiEvent = (
    | Case<"noteOn", {
        readonly channel: MidiChannel;
        readonly pitch: MidiPitch;
        readonly velocity: MidiVelocity;
    }>
    | Case<"noteOff", {
        readonly channel: MidiChannel;
        readonly pitch: MidiPitch;
        readonly velocity: MidiVelocity;
    }>
);

const NOTE_ON  = 0x90;
const NOTE_OFF = 0x80;

export const MidiEvent_getBytes = collect(UnionMatcher<MidiEvent, [], Generator<number>>({
    *noteOn({channel, pitch, velocity}) {
        yield NOTE_ON + channel;
        yield pitch;
        yield velocity;
    },
    *noteOff({channel, pitch, velocity}) {
        yield NOTE_OFF + channel;
        yield pitch;
        yield velocity;
    },
}));

//////////////////////
// PlannedMidiEvent //
//////////////////////

export class PlannedMidiEvent implements ComparableObject {
    readonly bytes: readonly number[];
    readonly timeMs: number;
    
    constructor(
        readonly event: MidiEvent,
        readonly time: AbsoluteTime,
    ) {
        this.bytes = MidiEvent_getBytes(event);
        this.timeMs = AbsoluteTime_toMilliSeconds(this.time)
    }
    
    compare(other: this): Ordering {
        return Ordering(
            compare(this.time, other.time),
        );
    }
}

export interface MidiMessageSink {
    send(message: readonly number[], timestampMs: number): void;
}

export function MidiMessageSink_sendAll(
    self: MidiMessageSink, 
    [...events]: Iterable<PlannedMidiEvent>,
): void {
    Array_sorted(events);
    
    for (const event of events) {
        self.send(event.bytes, event.timeMs);
    }
}
