import { ReplaceableFunction } from "@wkronemeijer/system";
import { ActualFileSystem } from "./ActualFileSystem";

export const GetFileSystem = ReplaceableFunction(() => ActualFileSystem);
