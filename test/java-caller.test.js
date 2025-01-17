#! /usr/bin/env node
"use strict";
const { JavaCaller } = require('../lib/index');
const os = require("os");
const which = require("which");
const path = require('path');

const {
    beforeEachTestCase,
    checkStatus,
    checkStdOutIncludes,
    checkStdErrIncludes
} = require("./helpers/common");
const { JavaCallerCli } = require('../lib/cli');

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
        const { status, stdout, stderr, childJavaProcess } = await java.run(['--sleep'], { detached: true });
        childJavaProcess.kill('SIGINT');
        checkStatus(0, status, stdout, stderr);
    });

    it("should call JavaCallerTester.class using javaw", async () => {
        const java = new JavaCaller({
            classPath: 'test/java/dist',
            mainClass: 'com.nvuillam.javacaller.JavaCallerTester'
        });
        const { status, stdout, stderr } = await java.run(['--sleep'], { windowless: true });
        checkStatus(0, status, stdout, stderr);
    });


    it("should call JavaCallerTester.class with proper stdout encoding", async () => {
        const java = new JavaCaller({
            classPath: 'test/java/dist',
            mainClass: 'com.nvuillam.javacaller.JavaCallerTester'
        });
        const { status, stdout, stderr, childJavaProcess } = await java.run(['--sleep'], { stdoutEncoding: 'binary' });
        childJavaProcess.kill('SIGINT');
        checkStatus(0, status, stdout, stderr);
    });

    it("should call JavaCallerTester.class with a classPath array", async () => {
        const java = new JavaCaller({
            classPath: ['test/java/dist'],
            mainClass: 'com.nvuillam.javacaller.JavaCallerTester'
        });
        const { status, stdout, stderr } = await java.run();

        checkStatus(0, status, stdout, stderr);
        checkStdOutIncludes(`JavaCallerTester is called !`, stdout, stderr);
    });

    it("should call JavaCallerTester.class with absolute classpaths", async () => {
        const java = new JavaCaller({
            classPath: __dirname + '/java/dist',
            useAbsoluteClassPaths: true,
            mainClass: 'com.nvuillam.javacaller.JavaCallerTester'
        });
        const { status, stdout, stderr } = await java.run();

        checkStatus(0, status, stdout, stderr);
        checkStdOutIncludes(`JavaCallerTester is called !`, stdout, stderr);
    });

    it("should use call JavaCallerTester.class with java and custom arguments", async () => {
        const java = new JavaCaller({
            classPath: 'test/java/dist',
            mainClass: 'com.nvuillam.javacaller.JavaCallerTester'
        });
        const { status, stdout, stderr } = await java.run(['-Xms256m', '-Xmx1024m', '-customarg nico']);

        checkStatus(0, status, stdout, stderr);
        checkStdOutIncludes(`JavaCallerTester is called !`, stdout, stderr);
        checkStdOutIncludes(`-customarg`, stdout, stderr);
        checkStdOutIncludes(`nico`, stdout, stderr);
    });

    it("should use call JavaCallerTester.class with javaArgs and custom arguments", async () => {
        const java = new JavaCaller({
            classPath: 'test/java/dist',
            mainClass: 'com.nvuillam.javacaller.JavaCallerTester'
        });
        const { status, stdout, stderr } = await java.run(['-customarg','nico'],{javaArgs: ['-Xms256m', '-Xmx1024m']});

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
        const { status, stdout, stderr } = await java.run();

        checkStatus(0, status, stdout, stderr);
        checkStdOutIncludes(`JavaCallerTester is called !`, stdout, stderr);
    });

    it("should call JavaCallerTester.class in JavaCallerTester.jar (override java)", async () => {
        let javaPath;
        try {
            javaPath = which.sync("java");
        } catch (e) {
            console.log("Java not found: ignore test method");
        }
        if (javaPath) {
            console.log(`Java found: ${javaPath}`);
            const java = new JavaCaller({
                classPath: 'test/java/jar/JavaCallerTester.jar',
                mainClass: 'com.nvuillam.javacaller.JavaCallerTester',
                javaExecutable: javaPath,
                javaOptions: "-Xms512m,-Xmx2g"
            });
            const { status, stdout, stderr } = await java.run();

            checkStatus(0, status, stdout, stderr);
            checkStdOutIncludes(`JavaCallerTester is called !`, stdout, stderr);
        }
    });

    it("should call JavaCallerTester.class in JavaCallerTesterRunnable.jar", async () => {
        const java = new JavaCaller({
            jar: 'test/java/jar/JavaCallerTesterRunnable.jar',
        });
        const { status, stdout, stderr } = await java.run();

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

        checkStatus(os.platform() === "win32" ? 1 : 127, status, stdout, stderr);
    });

    it("should use JavaCallerCli", async () => {
        const javaCli = new JavaCallerCli("examples/cli_app/lib");
        await javaCli.process();
    });

    it("Should work with an absolute path", async () => {
        const java = new JavaCaller({
            jar: path.join(process.cwd(), "test/java/jar/JavaCallerTesterRunnable.jar"),
        });
        const { status, stdout, stderr } = await java.run();

        checkStatus(0, status, stdout, stderr);
        checkStdOutIncludes(`JavaCallerTester is called !`, stdout, stderr);
    });
});
