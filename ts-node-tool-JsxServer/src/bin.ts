#!/usr/bin/env node

import { printError } from "@wkronemeijer/system";

import { main } from ".";

try {
    main();
} catch (err) {
    printError(err);
}
