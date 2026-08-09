#! /usr/bin/env node
const assert = require("assert");
const fs = require("fs");
const os = require("os");
const path = require("path");

// Locate an executable in PATH, honoring PATHEXT on Windows. Returns null when not found.
function findInPath(command) {
    const extensions = os.platform() === "win32" ? (process.env.PATHEXT || ".EXE").split(path.delimiter) : [""];
    for (const dir of (process.env.PATH || "").split(path.delimiter).filter(Boolean)) {
        for (const extension of extensions) {
            const candidate = path.join(dir, command + extension);
            if (fs.existsSync(candidate) && fs.statSync(candidate).isFile()) {
                return candidate;
            }
        }
    }
    return null;
}

// Reset codeNarcCallsCounter before each test
const beforeEachTestCase = function () {
    // Reinitialize java-caller cache
    globalThis.NODE_JAVA_CALLER_IS_INITIALIZED = false;
};

function checkStatus(statusCode, status, stdout, stderr) {
    assert(status === statusCode, `Status is ${statusCode} (${status} returned)\nstdout:\n${stdout}\nstderr:\n${stderr}`);
}

function checkStdOutIncludes(textToCheck, stdout, stderr) {
    assert(stdout && stdout.includes(textToCheck), `stdout contains ${textToCheck}\nstdout:\n${stdout}\nstderr:\n${stderr}`);
}

function checkStdOutIncludesOneOf(textsToCheck, stdout, stderr) {
    assert(stdout && textsToCheck.filter(txt => stdout.includes(txt)).length > 0,
        `stdout contains one of ${JSON.stringify(textsToCheck)}\nstdout:\n${stdout}\nstderr:\n${stderr}`);
}

function checkStdErrIncludes(textToCheck, stdout, stderr) {
    assert(stderr && stderr.includes(textToCheck), `stderr contains ${textToCheck}\nstdout:\n${stdout}\nstderr:\n${stderr}`);
}

module.exports = {
    beforeEachTestCase,
    findInPath,
    checkStatus,
    checkStdOutIncludes,
    checkStdOutIncludesOneOf,
    checkStdErrIncludes
}

