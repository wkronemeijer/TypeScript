import { Newtype } from "./Newtype";
import { Assert } from "../../Types/Assert";
export {};

type Assert_cannotAssignNormal = Assert<
    number extends Newtype<number, "Celsius">
? false : true>;

type Assert_canNest = Assert<
    Newtype<Newtype<string, "Uri">, "MediaUri"> extends Newtype<string, "Uri">
? true : false>;
