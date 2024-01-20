import { Medium } from "../Domain/Medium";
import { memo } from "react";

let counter = 1;

export const CMedium = memo(function (props: {
    readonly medium: Medium;
}): JSX.Element {
    const { kind, thumbUrl, relativeUrl } = props.medium;
    
    // TODO: Create a useUniqueId hook 
    const id = `instant-gallery-Medium-${counter++}`;
    
    return <>
        <input type="checkbox" id={id}/>
        <label htmlFor={id}>
            <div 
                className="CMedium"
                style={{ backgroundImage: `url(${thumbUrl})` }}
            >
                {(kind === "img") ? 
                <img   className="Content" loading="lazy" src={relativeUrl}/> : 
                <video className="Content" preload="none" src={relativeUrl} poster={thumbUrl} autoPlay loop muted/>}
            </div>
        </label>
    </>
});
