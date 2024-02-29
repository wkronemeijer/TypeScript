import { ReadWrite, freeze, swear, words } from "@wkronemeijer/system";
import { MediumAttribute } from "./Attribute";

// Could use a ReadonlyRecord<MediumAttribute, boolean>
// Wouldn't have comments then, however.
export interface MediumAttributeMap {
    /** Fit for display in an `img` element. */
    readonly image: boolean;
    /** Fit for display in an `audio` element. */
    readonly audio: boolean;
    /** Fit for display in an `video` element. */
    readonly video: boolean;
    /**
     * Does not need to change over time.
     * GIFs for example can be animated, but don't have to be.
     */
    readonly static: boolean;
    /** Can change over time. */
    readonly dynamic: boolean;
}

export function MediumAttributeMap(): ReadWrite<MediumAttributeMap> {
    return {
        image: false,
        audio: false,
        video: false,
        static: false,
        dynamic: false,
    };
}

/** Creates an attribute map from strings like `"video"` or `"dynamic image"`. */
export function MediumAttributeMap_from(string: string): MediumAttributeMap {
    const attributes = MediumAttributeMap();
    for (const attr of words(string)) {
        swear(MediumAttribute.hasInstance(attr), () => 
            `'${attr}' is not a medium attribute`
        );
        attributes[attr] = true;
    }
    attributes.static  ||= attributes.image;
    attributes.dynamic ||= attributes.audio;
    attributes.dynamic ||= attributes.video;
    return freeze(attributes);
}
