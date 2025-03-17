import {AugmentedDispatch, augmentDispatch} from "../Store/StoredCall";
import {Dispatch, useMemo} from "react";

/** @deprecated Consider using `@wkronemeijer/draftable-store`. */
export function useAugmentedDispatch<T>(dispatch: Dispatch<T>): AugmentedDispatch<T> {
    const augmented = useMemo(() => augmentDispatch(dispatch), [dispatch]);
    // dispatch is typically stable, so this should never run
    return augmented;
}
