# Changelog

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
