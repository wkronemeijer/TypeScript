import {createRoot, Root} from "react-dom/client";
import {panic} from "@wkronemeijer/system";

const IdPrefix = '#';

export function createRootById(id: string): Root {
    if (id.startsWith(IdPrefix)) {
        id = id.slice(IdPrefix.length);
    }
    const viewport = document.getElementById(id) ?? panic(
        `could not find '#${id}'`
    );
    return createRoot(viewport);
}
