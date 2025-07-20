import {Newtype} from "./Newtype";
import {Assert} from "../../Types/Assert";

type Celsius = Newtype<number, "Celsius">;

// Where is #[expect(error)]?

export type __Assert_cannotAssignNormal = Assert<(
    number extends Celsius
? false : true)>;

type Uri       = Newtype<string, "Uri">;
type MediumUri = Newtype<Uri, "MediaUri">;

export type __Assert_canNest = Assert<(
    MediumUri extends Uri
? true : false)>;

type Chord = Newtype<readonly number[], "Chord">;

export type __Assert_allowsNonPrimitives = Assert<(
    readonly number[] extends Chord
? false : true)>;
