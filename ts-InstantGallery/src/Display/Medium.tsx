import { Medium } from "../Domain/Medium";

let counter = 1;

export const CMedium = (props: {
    readonly medium: Medium;
}): JSX.Element => {
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
                <img   className="Content" src={relativeUrl}/> : 
                <video className="Content" src={relativeUrl} autoPlay loop muted/>}
            </div>
        </label>
    </>
};
