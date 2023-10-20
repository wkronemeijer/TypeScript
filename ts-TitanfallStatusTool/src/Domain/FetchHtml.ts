import { sleep, swear } from "@wkronemeijer/system";

const FetchOptions: RequestInit = {
    method: "GET",
    headers: new Headers({
        "content-type": "text/html",
    }),
    credentials: "omit",
};

export async function fetchHtml(url: string): Promise<string> {
    await sleep(500 + 2000 * Math.random()); // TODO: remove when done
    const response = await fetch(url, FetchOptions);
    swear(response.ok, () => 
        `request failed (${response.status} ${response.statusText})`);
    return await response.text();
}
