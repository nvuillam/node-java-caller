#! /usr/bin/env node

// Reset codeNarcCallsCounter before each test
const beforeEachTestCase = function () {
    // Reinitialize java-caller cache
    globalThis.NODE_JAVA_CALLER_IS_INITIALIZED = false;
};

module.exports = { beforeEachTestCase }

