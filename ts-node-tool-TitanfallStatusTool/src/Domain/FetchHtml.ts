import {swear} from "@wkronemeijer/system";
import {JSDOM} from "jsdom";

const FetchOptions: RequestInit = {
    method: "GET",
    headers: new Headers({
        "content-type": "text/html",
    }),
    credentials: "omit",
};

async function fetchHtml(url: string): Promise<string> {
    const response = await fetch(url, FetchOptions);
    swear(response.ok, () => 
        `request failed (${response.status} ${response.statusText})`);
    return await response.text();
}

export async function fetchDocument(url: string): Promise<Document> {
    return new JSDOM(await fetchHtml(url)).window.document;
}
