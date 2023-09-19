#! /usr/bin/env node
"use strict";
const { JavaCaller } = require('../lib/index');

const {
    beforeEachTestCase,
    checkStatus,
    checkStdOutIncludes,
    checkStdOutIncludesOneOf,
} = require("./helpers/common");

const javaVersionsToTest = [8, 9, 10, 11, 12, 13, 14, 17, 20];
const javaTypesToTest = ['jre', 'jdk'];

describe("Test all installs", () => {
    beforeEach(beforeEachTestCase);

    it(`should use Java jre from 10 to 12`, async () => {
        const java = new JavaCaller({
            classPath: 'test/java/dist',
            mainClass: 'com.nvuillam.javacaller.JavaCallerTester',
            minimumJavaVersion: 10,
            maximumJavaVersion: 12,
            javaType: "jre"
        });
        const { status, stdout, stderr } = await java.run();

        checkStatus(0, status, stdout, stderr);
        checkStdOutIncludes(`JavaCallerTester is called !`, stdout, stderr);
        checkStdOutIncludesOneOf([
            `Java runtime version 10`,
            `Java runtime version 11`,
            `Java runtime version 12`
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


