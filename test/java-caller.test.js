#! /usr/bin/env node
"use strict";
const { JavaCaller } = require('../lib/index');
const assert = require("assert");

const {
    beforeEachTestCase
} = require("./helpers/common");

describe("Call with classes", () => {
    beforeEach(beforeEachTestCase);

    it("should call JavaCallerTester.class attached", async () => {
        const java = new JavaCaller({
            classPath: 'test/java/dist',
            mainClass: 'com.nvuillam.javacaller.JavaCallerTester'
        });
        const { status, stdout, stderr } = await java.run();

        checkStatus(0, status, stdout, stderr);
        checkStdOutIncludes(`JavaCallerTester is called !`, stdout, stderr);
    });

    it("should call JavaCallerTester.class detached", async () => {
        const java = new JavaCaller({
            classPath: 'test/java/dist',
            mainClass: 'com.nvuillam.javacaller.JavaCallerTester'
        });
        const { status, stdout, stderr } = await java.run('', { detached: true });

        checkStatus(0, status, stdout, stderr);
    });

    it("should use call JavaCallerTester.class with java and custom arguments", async () => {
        const java = new JavaCaller({
            classPath: 'test/java/dist',
            mainClass: 'com.nvuillam.javacaller.JavaCallerTester'
        });
        const { status, stdout, stderr } = await java.run(['-Xms256m', '-Xmx2048m', '-customarg nico']);

        checkStatus(0, status, stdout, stderr);
        checkStdOutIncludes(`JavaCallerTester is called !`, stdout, stderr);
        checkStdOutIncludes(`-customarg`, stdout, stderr);
        checkStdOutIncludes(`nico`, stdout, stderr);
    });

    it("should call JavaCallerTester.class in JavaCallerTester.jar", async () => {
        const java = new JavaCaller({
            classPath: 'test/java/jar/JavaCallerTester.jar',
            mainClass: 'com.nvuillam.javacaller.JavaCallerTester'
        });
        const { status, stdout, stderr } = await java.run('');

        checkStatus(0, status, stdout, stderr);
        checkStdOutIncludes(`JavaCallerTester is called !`, stdout, stderr);
    });

    it("should call JavaCallerTester.class in JavaCallerTesterRunnable.jar", async () => {
        const java = new JavaCaller({
            jar: 'test/java/jar/JavaCallerTesterRunnable.jar',
        });
        const { status, stdout, stderr } = await java.run('');

        checkStatus(0, status, stdout, stderr);
        checkStdOutIncludes(`JavaCallerTester is called !`, stdout, stderr);
    });

    it("should trigger a class not found error", async () => {
        const java = new JavaCaller({
            classPath: 'nawak',
            mainClass: 'nimpor.te.quoi'
        });
        const { status, stdout, stderr } = await java.run();

        checkStatus(1, status, stdout, stderr);
        checkStdErrIncludes(`nimpor.te.quoi`, stdout, stderr);
    });

    it("should trigger a node spawn error", async () => {
        const java = new JavaCaller({
            classPath: 'nawak',
            mainClass: 'nimpor.te.quoi',
            javaExecutable: '/not/ there/java/bin/java.exe'
        });
        const { status, stdout, stderr } = await java.run();

        checkStatus(666, status, stdout, stderr);
        checkStdErrIncludes(`spawn error`, stdout, stderr);
    });

});

function checkStatus(statusCode, status, stdout, stderr) {
    assert(status === statusCode, `Status is ${statusCode} (${status} returned)\nstdout:\n${stdout}\nstderr:\n${stderr}`);
}

function checkStdOutIncludes(textToCheck, stdout, stderr) {
    assert(stdout && stdout.includes(textToCheck), `stdout contains ${textToCheck}\nstdout:\n${stdout}\nstderr:\n${stderr}`);
}

function checkStdErrIncludes(textToCheck, stdout, stderr) {
    assert(stderr && stderr.includes(textToCheck), `stderr contains ${textToCheck}\nstdout:\n${stdout}\nstderr:\n${stderr}`);
}        