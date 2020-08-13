#! /usr/bin/env node
const { JavaCaller } = require("./java-caller");
const fse = require("fs-extra");
const path = require("path");

class JavaCallerCli {
    "use strict";

    javaCallerOptions;

    constructor(baseDir) {
        // Use user-defined JSON file to read configuration
        const configFile = path.resolve(`${baseDir}/java-caller-config.json`);
        const options = fse.readJSONSync(configFile);
        // Default output is console with CLI
        if (options.output == null) {
            options.output = "console";
        }
        if (options.rootPath == null) {
            options.rootPath = baseDir;
        }
        this.javaCallerOptions = options;
    }

    async process() {
        const java = new JavaCaller(this.javaCallerOptions);
        const args = [...process.argv];
        args.splice(0, 2);
        const { status } = await java.run(args);
        process.exitCode = status;
    }
}

module.exports = { JavaCallerCli };
