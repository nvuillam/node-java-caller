#! /usr/bin/env node
"use strict";

console.log("npm run test initialized");
// Traces can no longer be enabled from here: util.debuglog only reads NODE_DEBUG from the
// environment the process was launched with. Run `npm run test:debug`, or launch your
// debugger with NODE_DEBUG=java-caller set.

// Reinitialize cache
globalThis.JAVA_CALLER_VERSIONS_CACHE = null;
