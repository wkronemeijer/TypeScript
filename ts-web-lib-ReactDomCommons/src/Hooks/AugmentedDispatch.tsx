import {AugmentedDispatch, augmentDispatch} from "../ArrayDispatch/StoredCall";
import {Dispatch, useMemo} from "react";

export function useAugmentedDispatch<T>(dispatch: Dispatch<T>): AugmentedDispatch<T> {
    const augmented = useMemo(() => augmentDispatch(dispatch), [dispatch]);
    // dispatch is typically stable, so this should never run
    return augmented;
}
