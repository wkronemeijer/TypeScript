# JSX Server

Serves all files located in the current directory, and applies the following tranforms:

## Virtual files run on the server

### `/` &rarr; `text/html`
Returns an overview of all react pages.
### 🚧 `???` &rarr; `application/json`
Returns an directory listing.
Supports recursion and wildcard filter parameters.

## Files compiled and run on the server

### `*.page.tsx` &rarr; `text/html`
Bundles and then runs the code on the server, rendering its default export using react. Similar to PHP.

### `*.json.ts` &rarr; `application/json`
Bundles and then runs the code on the server, stringifying its default export as JSON.

## Files compiled on the server, run on the client

### `*.ts[x]` &rarr; `text/javascript`
Bundles the code, then serves it as a single javascript.

### `*.scss` &rarr; `text/css`
Bundles the styling, then serves it as a single stylesheet.
