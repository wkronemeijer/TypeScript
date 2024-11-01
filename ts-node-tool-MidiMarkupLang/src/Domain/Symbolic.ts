import {Case, floor, isFinite, isInteger, Member, modulo, Newtype, NewtypeChecker, StringEnum, swear} from "@wkronemeijer/system";
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

const SEMITONE_COUNT = PitchClass.values.length;

export type  Pitch = Newtype<number, "Pitch">;
export function Pitch({pitchClass, octave}: PitchObject): Pitch {
    const ord = PitchClass.getOrdinal(pitchClass);
    return (ord + SEMITONE_COUNT * octave) as Pitch;
}

export interface PitchObject {
    readonly pitchClass: PitchClass;
    readonly octave: number;
}

type OctaveNo = (0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9);

export type PitchString = `${PitchClass}${OctaveNo}`;

export function parsePitchObject(string: (
    | PitchString 
    | (string & {})
)): PitchObject | undefined {
    string = string.toUpperCase().trim();
    
    if (string.length < 2 || string.length > 3) {return}
    
    const len = string.length;
    const pitchClass   = string.slice(  0    , len - 1);
    const octaveString = string.slice(len - 1, len    );
    
    if (!PitchClass.hasInstance(pitchClass)) {return}
    
    const octave = parseInt(octaveString);
    if (!isInteger(octave)) {return}    
    
    return {pitchClass, octave};
}

export function Pitch_toObject(self: Pitch): PitchObject {
    const pc = PitchClass.fromOrdinal(modulo(self, SEMITONE_COUNT));
    const octave = floor(self / SEMITONE_COUNT);
    swear(pc !== undefined);
    return {pitchClass: pc, octave};
}

/////////////////
// Timekeeping //
/////////////////

export type  AbsoluteTime = ReturnType<typeof AbsoluteTime>;
export const AbsoluteTime = NewtypeChecker("AbsoluteTime", {
    constrain: isFinite,
});

export type  RelativeTime = ReturnType<typeof RelativeTime>;
export const RelativeTime = NewtypeChecker("RelativeTime", {
    constrain: isFinite,
});

const MILLISECONDS_PER_SECOND = 1000;

export function AbsoluteTime_toMilliSeconds(self: AbsoluteTime): number {
    return MILLISECONDS_PER_SECOND * self;
}

interface SymbolicArrangement {
    
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
        readonly sequence: Arrangement[];
    }>
    | Case<"harmony", {
        readonly simultaneous: Arrangement[];
    }>
)
