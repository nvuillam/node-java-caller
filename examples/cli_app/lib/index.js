#! /usr/bin/env node
"use strict"

/*
   This file does not need to be updated, only java-caller-config.json must be !
*/

const { JavaCallerCli } = require("java-caller");

// Run asynchronously to use the returned status for process.exit
(async () => {
    await new JavaCallerCli(__dirname).process();
})();
