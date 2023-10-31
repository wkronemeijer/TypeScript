import { StringEnumPlaceholder } from "./StringEnumPlaceholder";

type OrdinalInitializer = (
    | number 
    | StringEnumPlaceholder
);

export type StringEnumInitializer<E extends string> = (
    | readonly E[] 
    | { readonly [P in E]: OrdinalInitializer; }
);
