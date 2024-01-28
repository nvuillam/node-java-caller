# Changelog

## Unreleased

- Add option for using javaw instead of java on run for Windows, by [@SotirisVas](https://github.com/SotirisVas) in [#65](https://github.com/nvuillam/node-java-caller/issues/65)

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
