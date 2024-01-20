#!/usr/bin/env node

import { printError } from "@wkronemeijer/system";

import { main } from ".";

try {
    main(process.argv.slice(2));
} catch (err) {
    printError(err);
}
