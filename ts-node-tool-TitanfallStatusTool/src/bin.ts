#!/usr/bin/env node

import {printThrowable} from "@wkronemeijer/system";
import {main} from ".";

try {
    main();
} catch (err) {
    printThrowable(err);
}
