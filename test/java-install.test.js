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

// Only Adoptium/Temurin-available versions: LTS 8/11/17/21 + current feature
// releases (20, 25). Non-LTS versions Adoptium never published (e.g. 10, 14)
// are no longer auto-installable since AdoptOpenJDK retired.
const javaVersionsToTest = os.platform() === "darwin"
    ? [11, 17, 20, 21, 25]
    : [8, 11, 17, 20, 21, 25];
const javaTypesToTest = ['jre', 'jdk'];

// njre JRE download/extract is unreliably slow on the GitHub Actions Windows +
// Node 24 runner (upstream njre/Node-24 perf issue). Every test in this suite
// performs a real njre install, so skip the whole suite on that CI runner only.
// Local Windows + Node 24 runs are fine, so the guard also requires CI: it stays
// false locally (CI unset) and on every other OS/Node combo. Remove once njre
// fixes the perf.
const isCI = !!process.env.CI; // GitHub Actions sets CI=true (and GITHUB_ACTIONS=true)
const SKIP_NJRE_INSTALL_ON_WIN_NODE24 = isCI && os.platform() === "win32" && process.versions.node.split(".")[0] === "24";

describe("Test all installs", () => {
    before(function () {
        if (SKIP_NJRE_INSTALL_ON_WIN_NODE24) this.skip();
    });
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


