#! /usr/bin/env node
"use strict";
const os = require("os");
const { JavaCaller } = require('../lib/index');

const {
    beforeEachTestCase,
    checkStatus,
    checkStdOutIncludes,
    checkStdOutIncludesOneOf,
} = require("./helpers/common");

const javaVersionsToTest = os.platform() === "darwin"
    ? [11, 17, 20, 21]
    : [8, 11, 14, 17, 20, 21];
const javaTypesToTest = ['jre', 'jdk'];

describe("Test all installs", () => {
    beforeEach(beforeEachTestCase);

    it(`should use Java jre from 17 to 21`, async () => {
        const java = new JavaCaller({
            classPath: 'test/java/dist',
            mainClass: 'com.nvuillam.javacaller.JavaCallerTester',
            minimumJavaVersion: 17,
            maximumJavaVersion: 21,
            javaType: "jre"
        });
        const { status, stdout, stderr } = await java.run();

        checkStatus(0, status, stdout, stderr);
        checkStdOutIncludes(`JavaCallerTester is called !`, stdout, stderr);
        checkStdOutIncludesOneOf([
            `17`,
            `21`
        ], stdout, stderr)
    });

    for (const javaVersion of javaVersionsToTest) {
        for (const javaType of javaTypesToTest) {

            it(`should install and use Java ${javaType} ${javaVersion}`, async () => {
                const java = new JavaCaller({
                    classPath: 'test/java/dist',
                    mainClass: 'com.nvuillam.javacaller.JavaCallerTester',
                    minimumJavaVersion: javaVersion,
                    maximumJavaVersion: javaVersion,
                    javaType: javaType
                });
                const { status, stdout, stderr } = await java.run();

                checkStatus(0, status, stdout, stderr);
                checkStdOutIncludes(`JavaCallerTester is called !`, stdout, stderr);
                checkStdOutIncludes(`Java runtime version ${javaVersion}`, stdout, stderr)
            });
        }
    }

});


