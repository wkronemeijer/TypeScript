import { Newtype } from "./Newtype";
import { Assert } from "../../Types/Assert";

type Celsius = Newtype<number, "Celsius">;

type Assert_cannotAssignNormal = Assert<
    number extends Celsius
? false : true>;

type Uri       = Newtype<string, "Uri">;
type MediumUri = Newtype<Uri, "MediaUri">;

type Assert_canNest = Assert<
    MediumUri extends Uri
? true : false>;
