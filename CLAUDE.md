# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

`java-caller` is a lightweight cross-platform npm library to call Java commands from Node.js. Its headline feature is **auto-installing a matching JDK/JRE (8–21) via `njre`** when the host machine has no compatible Java, then spawning the java process. It ships as a published npm package (`main: ./lib/index.js`, `types: ./lib/index.d.ts`), so only `lib/` is distributed.

## Commands

```shell
npm run test                  # Run all mocha tests (timeout 300000ms; CI sets DEBUG=java-caller,njre)
npm run test:coverage         # Same, under nyc coverage (reports to coverage/, include is lib/**)
npm run test:debug            # Tests with DEBUG=java-caller enabled
npm run lint:fix              # eslint --fix on **/*.js, then prettier on lib (tab-width 4, print-width 150)

# Run a single test by name (mocha grep on the it()/describe() title):
npx mocha "test/**/*.test.js" --grep "should call JavaCallerTester.class attached"
```

There is no build step for the library — `lib/*.js` is the shipped source.

### Regenerating Java test fixtures

The tests run against compiled `.class` files and jars under `test/java/`. These are checked in; regenerate only when changing `JavaCallerTester.java`:

```shell
npm run java:compile          # javac --release 8 -> test/java/dist
npm run java:jar              # builds JavaCallerTester.jar + JavaCallerTesterRunnable.jar from the manifests
```

## Architecture

Three modules in `lib/`, re-exported from `index.js`:

- **`java-caller.js`** — the `JavaCaller` class, all the real logic.
- **`cli.js`** — `JavaCallerCli`, a thin wrapper that reads `java-caller-config.json` (next to the caller's `baseDir`) and forwards `process.argv` to `JavaCaller.run()`. This is how consumers ship Java executables as their own npm packages (see `examples/cli_app`).
- **`index.d.ts`** — hand-maintained TypeScript types; keep in sync with any option/signature change.

### The `run()` flow (the core to understand)

1. Resolve the java executable: an explicit `javaExecutable` / `JAVA_CALLER_JAVA_EXECUTABLE` is used as-is; otherwise the literal `"java"`/`"javaw"` triggers `manageJavaInstall()`.
2. **`manageJavaInstall()`** builds a semver rule from `minimumJavaVersion`/`maximumJavaVersion`, checks the system `java -version`, and if it doesn't satisfy the rule: looks for an already-installed match under `~/.java-caller/`, else installs one with `njre`, then **recurses**. On success it prepends the chosen java `bin` to `PATH` and sets `JAVA_HOME`.
3. **`buildArguments()`** partitions user args: anything starting with `-D`/`-X` (or listed in `additionalJavaArgs`/`runOptions.javaArgs`) is a JVM arg placed *before* `-jar <jar>` or `-cp <classPath> <mainClass>`; everything else is a program arg placed *after*. `jar` takes precedence over `classPath`+`mainClass`.
4. Spawns via `child_process.spawn`, collects stdout/stderr (unless `output: "console"` → `stdio: inherit`, or `detached` → `ignore`), and resolves `{ status, stdout, stderr, childJavaProcess }`.
5. **Always restores the previous `PATH` and `JAVA_HOME`** after the run — the env mutation is scoped to the call.

### Cross-cutting invariants — be careful when editing

- **PATH/JAVA_HOME mutation is temporary and must be reverted.** `prevPath`/`prevJavaHome` are captured in `addJavaInPath()` and restored at the end of `run()`. Don't add early returns that skip the restore.
- **Java-version resolution is cached on `globalThis.JAVA_CALLER_VERSIONS_CACHE`** to avoid repeated lookups across instances in one process. Tests reset this in `test/helpers/init.js`; if you add caching state, reset it there too.
- **Platform branching** lives in `getPlatformBinPath()` (darwin = `Contents/Home/bin`) and several `os.platform() === "win32"` checks. Windows also handles arg quoting (`windowsVerbatimArguments`), `javaw` for windowless, and `windowsHide`. Any new behavior must be validated on win32/darwin/linux.
- **`classPath`** accepts a string (split on `:`, converted to the OS delimiter) or a string array; resolved against `rootPath` unless `useAbsoluteClassPaths` is set.

## Testing notes

- Tests are mocha + `node:assert`, with shared helpers in `test/helpers/common.js` (`checkStatus`, `checkStdOutIncludes`, etc.) and per-run init in `test/helpers/init.js` (loaded via the `mocha.require` config in `package.json`).
- `test/java-install.test.js` exercises the real `njre` download/install path, which is why the mocha timeout is 5 minutes.
- CI (`.github/workflows/test.yml`) runs the matrix Node 18/20/24 × Java 8/11/17/21/25 × ubuntu/macos/windows, plus a no-Java coverage job that uploads to Codecov.
- macOS defaults `minimumJavaVersion` to 11 (no Java 8 there); keep that branch intact.
