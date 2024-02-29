import { Member, StringEnum } from "@wkronemeijer/system";

export type  MediumAttribute = Member<typeof MediumAttribute>;
export const MediumAttribute = StringEnum([
    "image",
    "audio",
    "video",
    "static",
    "dynamic",
]);
