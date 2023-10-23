#!/usr/bin/env node

import { main } from ".";

try {
    main(process.argv.slice(2));
} catch (err) {
    console.error(String(err));
}
