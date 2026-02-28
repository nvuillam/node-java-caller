# Changelog

## Unreleased

## [4.4.1] 2025-02-28

- Upgrade dependencies

## [4.4.0] 2025-02-07

- Add `timeout` and `killSignal` run options
- Add `windowsHide` (default: true) to allow to show window if `windowHide: true` is sent

## [4.3.3] 2025-02-03

- Add types definition to make library compliant with typescript usage
- Upgrade dependencies
- CI: Use MegaLinter javascript flavor for better performance

## [4.3.2] 2025-01-24

- Upgrade dependencies
- Refactor workflows to use OIDC (npm Trusted Publishers) to publish package

## [4.3.1] 2025-12-04

- Upgrade njre dependency
- CI: avoid jobs in double

## [4.3.0] 2025-12-03

- Add tests for Node 24 & Java 25
- CI: Upgrade MegaLinter to v9
- CI: Remove CircleCI
- Upgrade dependencies

## [4.2.1] 2025-05-25

- Fix to allow absolute path to JAR file
- Upgrade dependencies

## [4.2.0] 2025-02-23

- Upgrade to njre v1.4.2
- Upgrade dependencies

## [4.1.1] 2024-08-30

- Upgrade to njre v1.4.0
- Fix issue when package called from ES Module by using njre installPath option

## [4.1.0] 2024-08-20

- Upgrade to MegaLinter v8
- Upgrade npm dependencies, including base package njre to 1.3.0

## [4.0.0] 2024-05-08

- When java used has been installed by JavaCaller, use full java executable path to perform the calls
  - Before 4.00: Update PATH + `java -cp /home/circleci/project/test/java/dist com.nvuillam.javacaller.JavaCallerTester`
  - Since 4.0.0: Update PATH + `/home/circleci/.java-caller/jre/jdk-20.0.2+9/bin/java -cp /home/circleci/project/test/java/dist com.nvuillam.javacaller.JavaCallerTester`
  - For example handles issue where Java 21 is installed and you need to run Java 17 with JavaCaller
- Refactor CI/CD
  - Add additional tests in GitHub Actions
  - Test in more contexts (Mac, Java 21...)
- Java 8 and 14 on Mac are not supported: Set default minimum java version to 11 on Mac

## [3.3.1] 2024-04-28

- Upgrade tar dependency to avoid CVE

## [3.3.0] 2024-01-29

- Add option for using javaw instead of java on run for Windows, by [@SotirisVas](https://github.com/SotirisVas) in [#65](https://github.com/nvuillam/node-java-caller/issues/65)
- Add [github-dependents-info](https://github.com/nvuillam/node-java-caller/blob/main/docs/github-dependents-info.md) page and generation
- Update minor dependencies

## [3.2.0] 2023-11-26

- Upgrade njre to v1.1.0 (now handles Mac M1)

## [3.1.2] 2023-11-25

- Add support for configuring windowsVerbatimArguments on run to make it easier to create cross platform compatible code.

## [3.1.1] 2023-11-19

- fix couple of issues in the rule used to detect if desired java version is installed or not, by [@djukxe](https://github.com/djukxe) in [#46](https://github.com/nvuillam/node-java-caller/pull/46)

## [3.1.0] 2023-11-18

- Use semver module to check found java version instead of custom code
- Add java 17 to test cases
- Automate and secure releases using GitHub Actions
- Inclusivity: Rename git branch master into main

## [3.0.0] 2023-09-19

- Upgrade njre to 1.0.0 (Allowing to install until Java 20)
- Upgrade dependencies

## [2.7.0] 2022-11-16

- add stdoutEncoding option (default `utf8`) ([#26](https://github.com/nvuillam/node-java-caller/pull/26), by [danunafig](https://github.com/danunafig))

## [2.6.0] 2022-09-11

- Fix override of java executable on Linux & Mac environments ([#23](https://github.com/nvuillam/node-java-caller/pull/23))
- Allow to use `JAVA_CALLER_JAVA_EXECUTABLE` environment variable to force javaExecutable option
- Fix npm audit issues
- Upgrade dependencies
  - debug
  - eslint
  - fs-extra
  - mocha
  - njre
  - nyc
  - which

## [2.5.0] 2022-08-10

- Upgrade NPM dependencies
- CI: upgrade to [MegaLinter v6](https://oxsecurity.github.io/megalinter/latest/)

## [2.4.0] 2020-07-19

- Fix additionalJavaArgs issue #13

## [2.3.0] 2020-09-05

- Support absolute paths in classpath with argument `useAbsoluteClassPaths` and classPath as array of strings ([#12](https://github.com/nvuillam/node-java-caller/pull/12), by [Dan Gowans](https://github.com/dangowans))

## [2.2.3] 2020-09-05

- Fix Java 8 detection ([#101@npm-groovy-lint](https://github.com/nvuillam/npm-groovy-lint/issues/101))

## [2.2.0] 2020-08-29

- Fix CLASSPATH on windows in case there are spaces in paths
- Update License to MIT

## [2.1.0] 2020-08-12

- Allow to use java-caller to build your own CLI embedding java sources
- Example projects using module and CLI

## [2.0.0] 2020-08-11

- Big refactoring to simplify and enhance performances of code checking/installing java version
- Replace use of deprecated package [node-jre](https://github.com/schreiben/node-jre) by [njre](https://github.com/raftario/njre)
- Compliance with JDK & JRE from 8 to 14 ([AdoptOpenJdk](https://adoptopenjdk.net/) releases)

## [1.1.0] 2020-08-10

- Return `javaChildProcess` when `detached` is true, so it can be used to be killed later

## [1.0.0] 2020-08-10

- Initial version
