#!/usr/bin/env node

import { printError } from "@local/system";

import { main } from ".";

try {
    main();
} catch (err) {
    printError(err);
}
