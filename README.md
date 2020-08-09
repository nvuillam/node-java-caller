# Java-caller

[![Version](https://img.shields.io/npm/v/java-caller.svg)](https://npmjs.org/package/node-java-caller)
[![Downloads/week](https://img.shields.io/npm/dw/java-caller.svg)](https://npmjs.org/package/node-java-caller)
[![Downloads/total](https://img.shields.io/npm/dt/java-caller.svg)](https://npmjs.org/package/node-java-caller)
[![CircleCI](https://circleci.com/gh/nvuillam/node-java-caller/tree/master.svg?style=shield)](https://circleci.com/gh/nvuillam/node-java-caller/tree/master)
[![codecov](https://codecov.io/gh/nvuillam/node-java-caller/branch/master/graph/badge.svg)](https://codecov.io/gh/nvuillam/node-java-caller)
[![GitHub contributors](https://img.shields.io/github/contributors/nvuillam/node-java-caller.svg)](https://gitHub.com/nvuillam/node-java-caller/graphs/contributors/)
[![GitHub stars](https://img.shields.io/github/stars/nvuillam/node-java-caller?label=Star&maxAge=2592000)](https://GitHub.com/nvuillam/node-java-caller/stargazers/)
[![License](https://img.shields.io/npm/l/node-java-caller.svg)](https://github.com/nvuillam/node-java-caller/blob/master/package.json)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg?style=flat-square)](http://makeapullrequest.com)

- **WARNING: Initial development in progress**

Cross-platform JS module to easily call java from Node.js sources.
Automatically installs java (currently 1.8) if not present on the system

## Installation

```shell
npm install node-java-caller --save
```

## Usage

### Examples

Call a class located in classpath

```javascript
        const java = new JavaCaller({
            classPath: 'test/java/dist',
            mainClass: 'com.nvuillam.javacaller.JavaCallerTester'
        });
        const { status, stdout, stderr } = await java.run();
```

Call a class located in classpath with java and custom arguments

```javascript
        const java = new JavaCaller({
            classPath: 'test/java/dist',
            mainClass: 'com.nvuillam.javacaller.JavaCallerTester'
        });
        const { status, stdout, stderr } = await java.run(['-Xms256m', '-Xmx2048m', '-customarg nico']);
```

Call a class in jar located in classpath

```javascript
        const java = new JavaCaller({
            classPath: 'test/java/jar/JavaCallerTester.jar',
            mainClass: 'com.nvuillam.javacaller.JavaCallerTester'
        });
        const { status, stdout, stderr } = await java.run('');
```

Call a runnable jar

```javascript
        const java = new JavaCaller({
            jar: 'test/java/jar/JavaCallerTesterRunnable.jar',
        });
        const { status, stdout, stderr } = await java.run('');
```
