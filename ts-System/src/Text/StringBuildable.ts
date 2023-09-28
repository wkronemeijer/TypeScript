import type { Printable } from "../Traits/Printable";
import type { StringBuilder } from "./StringBuilder";

// TODO: Come up with a new name
// mind the stringBuild(foo) = foo.buildString(new Builder) symmetry

export interface StringBuildable<TArgs extends readonly any[] = []>
extends Printable {
    // Property and not a method to make it check for contravariance
    // See https://stackoverflow.com/a/68873722
    buildString: (result: StringBuilder, ...args: TArgs) => void;
}
