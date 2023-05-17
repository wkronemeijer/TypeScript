import { Newtype, requires } from "@wkronemeijer/system";

const wordRegex = /[A-Z][A-Za-z\-']*/;
const nameRegex = /[A-Z][A-Za-z\-']*( +[A-Z][A-Za-z\-']*)*/;
export const Identifier_wordRegex = wordRegex;

export type     Identifier = Newtype<string, "Name">;
export function Identifier(candidateName: string): Identifier {
    requires(nameRegex.test(candidateName), 
        () => `'${candidateName}' is not a valid identifier.`);
    return candidateName as Identifier;
}
