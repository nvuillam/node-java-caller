#! /usr/bin/env node
"use strict"

const { JavaCaller } = require("java-caller");

// Run asynchronously to use the returned status for process.exit
(async () => {
    try {
        await runExample();
    } catch (err) {
        console.error("Unexpected error: " + err.message + "\n" + err.stack);
        process.exitCode = 1;
    }
})();

// Example function
async function runExample() {
    console.log('Welcome to Java Caller example\n');
    console.log(`Let's use java-caller as a module !`);

    const java = new JavaCaller({
        classPath: 'java/JavaCallerTester.jar', // CLASSPATH referencing the package embedded jar files
        mainClass: 'com.nvuillam.javacaller.JavaCallerTester',// Main class to call, must be available from CLASSPATH,
        rootPath: __dirname,
        minimumJavaVersion: 10
    });
    const { status, stdout, stderr } = await java.run(['-a', 'list', '--of', 'arguments']);

    console.log(`The status code returned by java command is ${status}`);
    if (stdout) {
        console.log('stdout of the java command is :\n' + stdout);
    }
    if (stderr) {
        console.log('stderr of the java command is :\n' + stderr);
    }

    console.log("Now we can get back on the rest of our custom module code :)")
}