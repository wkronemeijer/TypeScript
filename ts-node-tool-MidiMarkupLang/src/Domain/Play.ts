// Takes an arrangements and turns it into a list of midi events

import {absoluteNow, AbsoluteTime, Arrangement, Pitch, RelativeTime, Time_shift, TimeSignature} from "./Symbolic";
import {MidiChannel, MidiPitch, MidiVelocity_Default, PlannedMidiEvent} from "./Midi";
import {UnionMatcher} from "@wkronemeijer/system";

export function Pitch_toMidi(self: Pitch): MidiPitch {
    
}

type play_Context = {
    readonly sink: PlannedMidiEvent[];
    readonly timeSoFar: AbsoluteTime,
    readonly secondsPerNote: RelativeTime;
};

const play = UnionMatcher<Arrangement, [play_Context], RelativeTime>({
    note({pitch: purePitch, length}, {sink, timeSoFar, secondsPerNote}) {
        const pitch = Pitch_toMidi(pitch);
        const channel = MidiChannel(1);
        const velocity = MidiVelocity_Default;
        sink.push(new PlannedMidiEvent({
            kind: "noteOn",
            pitch, 
            channel,
            velocity: velocity,
        }, timeSoFar));
        
        const duration = RelativeTime(length.toNumber() * secondsPerNote);
        timeSoFar = Time_shift(timeSoFar, duration);
        
        sink.push(new PlannedMidiEvent({
            kind: "noteOn",
            pitch, 
            channel,
            velocity: velocity,
        }, timeSoFar));
        
        return duration;
    },
    rest({length}, {secondsPerNote}) {
        return RelativeTime(length.toNumber() * secondsPerNote);
    },
    harmony({parts}, ctx) {
        for (const part of parts) {
            play(part, ctx);
        }
    },
    melody({}, ctx) {
        let time = 
        
        
        for (const part of parts) {
            
            play(part, ctx);
        }
    },
});

export function playArrangement({
    arrangement, 
    bpm, 
    timeSignature: sig, 
    sink, 
    timeStart = absoluteNow(),
}: {
    readonly arrangement: Arrangement; 
    readonly bpm: number; 
    readonly timeSignature: TimeSignature; 
    readonly sink: PlannedMidiEvent[];
    readonly timeStart?: AbsoluteTime;
}): AbsoluteTime {
    const beatsPerSecond = bpm / 60;
    const beatsPerNote = sig.lower;
    
    const secondsPerNote = RelativeTime(beatsPerNote / beatsPerSecond);
    
    const duration = play(arrangement, {
        
        
    });
    return Time_shift(timeStart, duration);
}
