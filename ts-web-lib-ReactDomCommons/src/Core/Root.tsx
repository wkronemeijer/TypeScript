import {createRoot, Root} from "react-dom/client";
import {panic} from "@wkronemeijer/system";

export function createRootById(id: string): Root {
    const viewport = document.getElementById(id) ?? panic(
        `could not find '#${id}'`
    );
    return createRoot(viewport);
}
