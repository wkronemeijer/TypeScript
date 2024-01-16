import { Member, StringEnum, capitalize, panic } from "@wkronemeijer/system";
import { DateTime } from "luxon";

export type  WeekDay = Member<typeof WeekDay>;
export const WeekDay = StringEnum({
    monday: 1,
    tuesday: 2,
    wednesday: 3,
    thursday: 4,
    friday: 5,
    saturday: 6,
    sunday: 7,
} as const);

export function WeekDay_fromDateTime(dateTime: DateTime): WeekDay {
    return WeekDay.fromOrdinal(dateTime.weekday) ?? panic();
}

export function WeekDay_toString(self: WeekDay): string  {
    return capitalize(self);
}
