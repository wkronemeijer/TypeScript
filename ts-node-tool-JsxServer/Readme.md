# JSX Server

Serves all files located in the current directory, and applies a transform to 2 types of files:
- `.tsx` files get bundled by `esbuild`, then served as `text/javascript`.
- `.page.tsx` get bundled as well, but are then executed on the server, and their default export (which should be a JSX element) is rendered to HTML.
