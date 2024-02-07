import { IdNewtype, ReadonlyURL, ReplaceableFunction, panic } from "@wkronemeijer/system";

export type  RaspRequestId = ReturnType<typeof RaspRequestId>;
export const RaspRequestId = IdNewtype("RaspRequestId");

export interface RaspRequestProxy {
    readonly url: ReadonlyURL;
    /** This file will return the current (non-error) result for the rest of the lifetime of the server. */
    // TODO: retainResult(): void;
}

export interface RaspServerProxy {
    getRootName(): string;
    getRequest(id: RaspRequestId): RaspRequestProxy | undefined;
    
    // TODO: getSiteMap(): SiteMap;
}

export const GetRaspServer = ReplaceableFunction((): RaspServerProxy => {
    panic("No server registered.");
});
