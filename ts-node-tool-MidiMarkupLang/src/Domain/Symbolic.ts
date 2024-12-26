import {Case, floor, from, isFinite, isInteger, Member, modulo, Newtype, NewtypeChecker, panic, StringEnum, swear, UnionMatcher} from "@wkronemeijer/system";
import {Ratio} from "./Ratio";

export type  PitchClass = Member<typeof PitchClass>;
export const PitchClass = StringEnum({
    "C": 0,
    "C#": 1,
    "D": 2,
    "D#": 3,
    "E": 4,
    "F": 5,
    "F#": 6,
    "G": 7,
    "G#": 8,
    "A": 9,
    "A#": 10,
    "B": 11,
});

const SEMITONE_COUNT = 12;
swear(SEMITONE_COUNT === PitchClass.values.length);

export type     Pitch = Newtype<number, "Pitch">;
export function Pitch(pitchClass: PitchClass = "C", octave = 4): Pitch {
    const ord = PitchClass.getOrdinal(pitchClass);
    swear(isInteger(octave), "octave must be an integer");
    return (ord + SEMITONE_COUNT * octave) as Pitch;
}

export function Pitch_deconstruct(self: Pitch): [PitchClass, number] {
    const pc = PitchClass.fromOrdinal(modulo(self, SEMITONE_COUNT));
    const octave = floor(self / SEMITONE_COUNT);
    swear(pc !== undefined);
    return [pc, octave];
}

/** &approx; relative pitch */
export type  Interval = Newtype<number, "Interval">;
export const Interval = NewtypeChecker("Interval", {
    constrain: isInteger,
});

export const Pitch_shift: {
    (self: Pitch, size: Interval): Pitch;
    (self: Interval, size: Interval): Interval;
} = (self: Pitch | Interval, size: Interval): any => {
    return self + size;
};

/////////////////////
// Parsing pitches //
/////////////////////

type OctaveNo = (0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9);

export type PitchString = `${PitchClass}${OctaveNo}`;

export function parsePitch(string: (
    | PitchString 
    | (string & {})
)): Pitch | undefined {
    string = string.toUpperCase().trim();
    if (string.length < 2 || string.length > 3) {return}
    
    const len = string.length;
    const pitchClass   = string.slice(  0    , len - 1);
    const octaveString = string.slice(len - 1, len    );
    
    if (!PitchClass.hasInstance(pitchClass)) {return}
    
    const octave = parseInt(octaveString);
    if (!isInteger(octave)) {return}    
    
    return Pitch(pitchClass, octave);
}

export function pitch(string: PitchString): Pitch {
    return parsePitch(string) ?? panic(
        `failed to parse '${string}' as pitch`
    );
}

pitch("C4");

/////////////////
// Timekeeping //
/////////////////

export type  AbsoluteTime = ReturnType<typeof AbsoluteTime>;
export const AbsoluteTime = NewtypeChecker("AbsoluteTime", {
    constrain: isFinite,
});

export function absoluteNow(): AbsoluteTime {
    return AbsoluteTime(performance.now() / MILLISECONDS_PER_SECOND);
}

export type  RelativeTime = ReturnType<typeof RelativeTime>;
export const RelativeTime = NewtypeChecker("RelativeTime", {
    constrain: isFinite,
});

export type Time = (
    | AbsoluteTime
    | RelativeTime
);

export const Time_shift: {
    (self: AbsoluteTime, size: RelativeTime): AbsoluteTime;
    (self: RelativeTime, size: RelativeTime): RelativeTime;
} = (self: Time, size: RelativeTime): any => {
    return self + size;
};

const MILLISECONDS_PER_SECOND = 1000;

export function Time_toMilliSeconds(self: Time): number {
    return MILLISECONDS_PER_SECOND * self;
}

////////////////
// Combinator //
////////////////

export type Arrangement = (
    | Case<"note", {
        readonly pitch: Pitch;
        readonly length: Ratio;
    }>
    | Case<"rest", {
        readonly length: Ratio;
    }>
    | Case<"melody", {
        readonly parts: Arrangement[];
    }>
    | Case<"harmony", {
        readonly parts: Arrangement[];
    }>
);

export const Arrangement_getLength = UnionMatcher<Arrangement, [], Ratio>({
    note({length}): Ratio {
        return length;
    },
    rest({length}): Ratio {
        return length;
    },
    harmony({parts}): Ratio {
        return (
            from(parts)
            .max(part => Arrangement_getLength(part))
        ) ?? Ratio.zero;
    },
    melody({parts}): Ratio {
        return from(parts).aggregate(Ratio.zero, (sum, part) => sum.plus(Arrangement_getLength(part)));
    }
})

////////////////////
// Time Signature //
////////////////////

export interface TimeSignature {
    readonly upper: number;
    readonly lower: number;
}

export function TimeSignature(upper: number, lower: number): TimeSignature {
    return {upper, lower};
}
