import { from } from "@wkronemeijer/system";

import { Medium } from "../Domain/Medium";
import { CMedium } from "./Medium";
import { ObjectFit } from "../Domain/ProgramOptions";

export const CApp = (props: {
    readonly media: Iterable<Medium>;
    readonly mediaLimit: number;
}): JSX.Element => {
    const { media, mediaLimit } = props;
    
    return <div className="CApp">
        {from(media)
        .take(mediaLimit)
        .select(medium => 
        <CMedium key={medium.hash} medium={medium}/>)
        .toArray()}
    </div>
};
