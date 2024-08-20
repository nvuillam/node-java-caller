#! /usr/bin/env node
const debug = require("debug")("java-caller");
const fse = require("fs-extra");
const os = require("os");
const path = require("path");
const { spawn } = require("child_process");
const util = require("util");
const execPromise = util.promisify(require("child_process").exec);
const semver = require("semver");

class JavaCaller {
    "use strict";
    minimumJavaVersion = os.platform() === "darwin" ? 11 : 8; // Mac starts at 11
    maximumJavaVersion;
    javaType;
    rootPath = ".";

    jar;
    classPath = ".";
    useAbsoluteClassPaths = false;
    mainClass;
    output = "none"; // can be none or console
    status = null;

    javaSupportDir;
    javaExecutable = "java";
    javaExecutableWindowless = "javaw";
    additionalJavaArgs = [];
    commandJavaArgs = [];

    javaHome;
    javaBin;
    javaExecutableFromNodeJavaCaller;

    prevPath;
    prevJavaHome;

    /**
     * Creates a JavaCaller instance
     * @param {object} [opts] - Run options
     * @param {string} [opts.jar] - Path to executable jar file
     * @param {string | string[]} [opts.classPath] - If jar parameter is not set, classpath to use. Use : as separator (it will be converted if runned on Windows), or use a string array
     * @param {boolean} [opts.useAbsoluteClassPaths] - Set to true if classpaths should not be based on the rootPath
     * @param {string} [opts.mainClass] - If classPath set, main class to call
     * @param {number} [opts.minimumJavaVersion] - Minimum java version to be used to call java command. If the java version found on machine is lower, java-caller will try to install and use the appropriate one
     * @param {number} [opts.maximumJavaVersion] - Maximum java version to be used to call java command. If the java version found on machine is upper, java-caller will try to install and use the appropriate one
     * @param {string} [opts.javaType] - jre or jdk (if not defined and installation is required, jre will be installed)
     * @param {string} [opts.rootPath] - If classPath elements are not relative to the current folder, you can define a root path. You may use __dirname if you classes / jars are in your module folder
     * @param {string} [opts.javaExecutable] - You can force to use a defined java executable, instead of letting java-caller find/install one
     * @param {string} [opts.additionalJavaArgs] - Additional parameters for JVM that will be added in every JavaCaller instance runs
     */
    constructor(opts) {
        this.jar = opts.jar || this.jar;
        this.classPath = opts.classPath || this.classPath;
        this.useAbsoluteClassPaths = opts.useAbsoluteClassPaths || this.useAbsoluteClassPaths;
        this.mainClass = opts.mainClass || this.mainClass;
        this.minimumJavaVersion = opts.minimumJavaVersion || this.minimumJavaVersion;
        this.maximumJavaVersion = opts.maximumJavaVersion || this.maximumJavaVersion;
        this.javaType = opts.javaType || this.javaType;
        this.rootPath = opts.rootPath || this.rootPath;
        this.javaCallerSupportDir = `${os.homedir() + path.sep}.java-caller`;
        this.javaExecutable = opts.javaExecutable || process.env.JAVA_CALLER_JAVA_EXECUTABLE || this.javaExecutable;
        this.javaExecutableFromNodeJavaCaller = null;
        this.additionalJavaArgs = opts.additionalJavaArgs || this.additionalJavaArgs;
        this.output = opts.output || this.output;
    }

    /**
     * Runs java command of a JavaCaller instance
     * @param {string[]} [userArguments] - Java command line arguments
     * @param {object} [runOptions] - Run options
     * @param {boolean} [runOptions.detached = false] - If set to true, node will node wait for the java command to be completed. In that case, childJavaProcess property will be returned, but stdout and stderr may be empty
     * @param {string} [runOptions.stdoutEncoding = 'utf8'] - Adds control on spawn process stdout
     * @param {number} [runOptions.waitForErrorMs = 500] - If detached is true, number of milliseconds to wait to detect an error before exiting JavaCaller run
     * @param {string} [runOptions.cwd = .] - You can override cwd of spawn called by JavaCaller runner
     * @param {string} [runOptions.javaArgs = []] - You can override cwd of spawn called by JavaCaller runner
     * @param {string} [runOptions.windowsVerbatimArguments = true] - No quoting or escaping of arguments is done on Windows. Ignored on Unix. This is set to true automatically when shell is specified and is CMD.
     * @return {Promise<{status:number, stdout:string, stderr:string, childJavaProcess:ChildProcess}>} - Command result (status, stdout, stderr, childJavaProcess)
     */
    async run(userArguments, runOptions = {}) {
        runOptions.detached = typeof runOptions.detached === "undefined" ? false : runOptions.detached;
        runOptions.waitForErrorMs = typeof runOptions.waitForErrorMs === "undefined" ? 500 : runOptions.waitForErrorMs;
        runOptions.cwd = typeof runOptions.cwd === "undefined" ? process.cwd() : runOptions.cwd;
        runOptions.stdoutEncoding = typeof runOptions.stdoutEncoding === "undefined" ? "utf8" : runOptions.stdoutEncoding;
        runOptions.windowsVerbatimArguments = typeof runOptions.windowsVerbatimArguments === "undefined" ? true : runOptions.windowsVerbatimArguments;
        runOptions.windowless = typeof runOptions.windowless === "undefined" ? false : os.platform() !== "win32" ? false : runOptions.windowless;
        this.commandJavaArgs = (runOptions.javaArgs || []).concat(this.additionalJavaArgs);

        let javaExe = runOptions.windowless ? this.javaExecutableWindowless : this.javaExecutable;
        if (javaExe.toLowerCase().includes(".exe") && javaExe.includes(" ") && !javaExe.includes(`'`)) {
            // Java executable has been overridden by caller : use it
            javaExe = `"${path.resolve(javaExe)}"`;
        } else if (javaExe === "java" || javaExe === "javaw") {
            // Check if matching java version is present, install and update PATH if it is not
            await this.manageJavaInstall();
        }

        const javaExeToUse = this.javaExecutableFromNodeJavaCaller ?? javaExe;
        const classPathStr = this.buildClasspathStr();
        const javaArgs = this.buildArguments(classPathStr, (userArguments || []).concat(this.commandJavaArgs));
        let stdout = "";
        let stderr = "";
        let child;
        const prom = new Promise((resolve) => {
            // Spawn java command line
            debug(`Java command: ${javaExeToUse} ${javaArgs.join(" ")}`);
            const spawnOptions = {
                detached: runOptions.detached,
                cwd: javaExeToUse === "java" || javaExeToUse === "javaw" ? runOptions.cwd : undefined,
                env: Object.assign({}, process.env),
                stdio: this.output === "console" ? "inherit" : runOptions.detached ? "ignore" : "pipe",
                windowsHide: true,
                windowsVerbatimArguments: runOptions.windowsVerbatimArguments,
            };
            if (javaExeToUse.includes(" ")) {
                spawnOptions.shell = true;
            }
            child = spawn(javaExeToUse, javaArgs, spawnOptions);

            // Gather stdout and stderr if they must be returned
            if (spawnOptions.stdio === "pipe") {
                child.stdout.setEncoding(`${runOptions.stdoutEncoding}`);
                child.stdout.on("data", (data) => {
                    stdout += data;
                });
                child.stderr.on("data", (data) => {
                    stderr += data;
                });
            }

            // Catch error
            child.on("error", (data) => {
                this.status = 666;
                stderr += "Java spawn error: " + data;
                resolve();
            });

            // Catch status code
            child.on("close", (code) => {
                this.status = code;
                resolve();
            });

            // Detach from main process in case detached === true
            if (runOptions.detached) {
                child.unref();
            }
        });

        if (runOptions.detached) {
            // Detached mode: Just wait a little amount of time in case you want to check a command error
            await new Promise((resolve) =>
                setTimeout(() => {
                    resolve();
                }, runOptions.waitForErrorMs),
            );
        } else {
            // Not detached mode: wait for Promise to be resolved
            await prom;
        }

        // Build result
        const result = {
            status: this.status,
            stdout: stdout,
            stderr: stderr,
        };
        if (child) {
            result.childJavaProcess = child;
        }

        // Restore previous values of PATH & JAVA_HOME
        process.env["PATH"] = this.prevPath || process.env["PATH"];
        process.env["JAVA_HOME"] = this.prevJavaHome || process.env["JAVA_HOME"];

        return result;
    }

    // Translate the classpath from a string or string array into a string
    buildClasspathStr() {
        let classPathList = [];

        if (typeof this.classPath === "string") {
            classPathList = this.classPath.split(":");
        } else {
            classPathList = this.classPath;
        }

        if (!this.useAbsoluteClassPaths) {
            classPathList = classPathList.map((classPathElt) => path.resolve(this.rootPath + path.sep + classPathElt));
        }

        return classPathList.join(path.delimiter);
    }

    // Set first java arguments, then jar || classpath, then jar/class user arguments
    buildArguments(classPathStr, userArgs, windowsVerbatimArguments) {
        let javaArgs = [];
        let programArgs = [];
        for (const arg of userArgs) {
            if (arg.startsWith("-D") || arg.startsWith("-X") || this.commandJavaArgs.includes(arg)) {
                javaArgs.push(arg);
            } else {
                programArgs.push(arg);
            }
        }
        let allArgs = [];
        allArgs.push(...javaArgs);
        if (this.jar) {
            allArgs.push(
                ...[
                    "-jar",
                    os.platform() === "win32" && windowsVerbatimArguments ? `"${this.rootPath}/${this.jar}"` : `${this.rootPath}/${this.jar}`,
                ],
            );
        } else {
            allArgs.push(...["-cp", os.platform() === "win32" && windowsVerbatimArguments ? `"${classPathStr}"` : classPathStr, this.mainClass]);
        }
        allArgs.push(...programArgs);
        return allArgs;
    }

    // Install Java if the found java version is not matching the requirements
    async manageJavaInstall() {
        if (this.javaExecutable !== 'java' && this.javaExecutable !== 'javaw') {
            // Do not search/install java if its path is sent as argument
            return;
        }
        if (await this.getInstallInCache()) {
            return;
        }
        let semverRule = ''
        if (this.minimumJavaVersion === this.maximumJavaVersion) {
            semverRule = `=${this.minimumJavaVersion}.x.x`;
        } else {
            semverRule = `>=${this.minimumJavaVersion}.0.0` + (this.maximumJavaVersion ? ` <=${this.maximumJavaVersion}.x.x` : '');
        }
        const javaVersion = await this.getJavaVersion();
        const requiresInstall = javaVersion === false ? true : !semver.satisfies(javaVersion, semverRule)
        if (requiresInstall) {
            // Check if the appropriate version has already been installed
            const { javaVersionHome = null, javaVersionBin = null } = await this.findJavaVersionHome();
            if (javaVersionHome) {
                // Matching java version has been found: use it
                this.javaHome = javaVersionHome;
                this.javaBin = javaVersionBin;
                await this.addJavaInPath();
                this.setJavaExecutableFromNodeJavaCaller(this.javaBin);
                return;
            }

            // Inform user that the installation is pending
            const requiredMsg =
                this.minimumJavaVersion !== this.maximumJavaVersion
                    ? `Java ${this.javaType ? this.javaType : "jre or jdk"} between ${this.minimumJavaVersion} and ${this.maximumJavaVersion
                    } is required `
                    : `Java ${this.javaType ? this.javaType : "jre or jdk"} ${this.minimumJavaVersion} is required`;
            console.log(requiredMsg);
            const javaVersionToInstall = this.maximumJavaVersion || this.minimumJavaVersion;
            const javaTypeToInstall = this.javaType || "jre";
            console.log(`Installing Java ${javaTypeToInstall} ${javaVersionToInstall} in ${this.javaCallerSupportDir}...`);

            // Create a directory for installing Java and ensure it contains a dummy package.json
            await fse.ensureDir(this.javaCallerSupportDir, { mode: "0777" });
            const packageJson = `${this.javaCallerSupportDir + path.sep}package.json`;
            if (!fse.existsSync(packageJson)) {
                const packageJsonContent = {
                    name: "java-caller-support",
                    version: "1.0.0",
                    description: "Java installations by java-caller (https://github.com/nvuillam/node-java-caller)",
                };
                await fse.writeFile(packageJson, JSON.stringify(packageJsonContent), "utf8");
            }

            // Install appropriate java version using njre
            const njre = require("njre");
            const njreOptions = { type: javaTypeToInstall };
            const prevRequireMainFilename = require.main.filename; // hack require.main.filename to njre installs java where we want
            require.main.filename = packageJson;
            const installDir = await njre.install(javaVersionToInstall, njreOptions);
            require.main.filename = prevRequireMainFilename; // unhack require.main.filename
            console.log(`Installed Java ${javaTypeToInstall} ${javaVersionToInstall} in ${installDir}...`);

            // Call again this method: now matching java version will be found :)
            return await this.manageJavaInstall();
        }
    }

    // Get matching version in java-caller cache
    async getInstallInCache() {
        if (globalThis.JAVA_CALLER_VERSIONS_CACHE != null) {
            for (const { version, file, java_home, java_bin } of globalThis.JAVA_CALLER_VERSIONS_CACHE) {
                if (this.checkMatchingJavaVersion(version, file)) {
                    this.javaHome = java_home;
                    this.javaBin = java_bin;
                    await this.addJavaInPath();
                    this.setJavaExecutableFromNodeJavaCaller(this.javaBin);
                    return true;
                }
            }
        }
        return false;
    }

    // Returns system default java version
    async getJavaVersion() {
        try {
            const { stderr } = await execPromise("java -version");
            const match = /version "(.*?)"/.exec(stderr);

            // see https://openjdk.org/jeps/223
            // semver.coerce does awfully good job of parsing anything Java throws our way
            const version = semver.valid(semver.coerce(match[1]))
            if (version === null) {
                throw new Error(`unparsable java version: ${match[1]}`)
            }

            debug(`Found default java version ${version}`);
            return version;
        } catch (e) {
            debug(`Java not found: ${e.message}`);
            return false;
        }
    }

    // Browse locally installed java versions
    // check if one matches with javaType , minimumJavaVersion and maximumJavaVersion
    async findJavaVersionHome() {
        const javaInstallsTopDir = path.join(this.javaCallerSupportDir, "jre");
        if (!fse.existsSync(javaInstallsTopDir)) {
            return {};
        }

        return await fse.readdir(javaInstallsTopDir)
            .then((items) =>
                items
                    .filter((item) => fse.statSync(path.join(javaInstallsTopDir, item)).isDirectory())
                    .map((folder) => {
                        const version = semver.coerce(folder)
                        return { version, folder }
                    })
                    .filter(({ version, folder }) => this.checkMatchingJavaVersion(version.major, folder))
                    .map(({ version, folder }) => {
                        const home = path.join(javaInstallsTopDir, folder);
                        const bin = path.join(home, this.getPlatformBinPath());
                        return { version, folder, home, bin }
                    })
                    .find(({ bin }) => fse.existsSync(bin))
            )
            .then((match) => {
                if (!match) return {};
                const { version, folder, home, bin } = match

                debug(
                    `Found matching java bin: ${bin} for ${this.javaType ? this.javaType : "jre or jdk"} ${this.minimumJavaVersion}${this.maximumJavaVersion && this.maximumJavaVersion !== this.minimumJavaVersion ? " -> " + this.maximumJavaVersion : "+"
                    }`
                );
                this.addInCache(version.major, folder, home, bin);

                return { javaVersionHome: home, javaVersionBin: bin };
            })
            .catch((e) => {
                debug(`findJavaVersionHome failed: ${e}`)
                return {}
            })
    }

    checkMatchingJavaVersion(versionFound, file) {
        if (versionFound < this.minimumJavaVersion) {
            return false;
        }
        if (this.maximumJavaVersion != null && versionFound > this.maximumJavaVersion) {
            return false;
        }
        if (this.javaType === "jre" && !file.includes("jre")) {
            return false;
        } else if (this.javaType === "jdk" && file.includes("jre")) {
            return false;
        }
        return true;
    }

    // Add java bin dir in PATH or JAVA_HOME
    async addJavaInPath() {
        this.prevPath = process.env["PATH"];
        this.prevJavaHome = process.env["JAVA_HOME"];
        // Add java-caller installed java version in PATH
        if (this.javaBin) {
            process.env["PATH"] = process.env["PATH"].includes(this.javaBin)
                ? process.env["PATH"]
                : this.javaBin + path.delimiter + process.env["PATH"];
            process.env["JAVA_HOME"] = this.javaHome;
        }
        // If JAVA_HOME is set, but not jdk or jre, add it in PATH
        else if (process.env["JAVA_HOME"] && !process.env["PATH"].includes("jdk") && !process.env["PATH"].includes("jre")) {
            process.env["PATH"] = process.env["PATH"].includes(process.env["JAVA_HOME"])
                ? process.env["PATH"]
                : process.env["JAVA_HOME"] + path.sep + this.getPlatformBinPath() + path.delimiter + process.env["PATH"];
        }
        if (process.env["PATH"] !== this.prevPath) {
            debug("Updated PATH with value: " + process.env["PATH"]);
        }
    }

    getPlatformBinPath() {
        const platform = os.platform();
        let binPath;
        switch (platform) {
            case "darwin":
                binPath = `Contents${path.sep}Home${path.sep}bin`;
                break;
            case "win32":
                binPath = "bin";
                break;
            case "linux":
                binPath = "bin";
                break;
            default:
                this.fail(`unsupported platform: ${platform}`);
        }
        return binPath;
    }

    setJavaExecutableFromNodeJavaCaller(javaBinPath) {
        this.javaExecutableFromNodeJavaCaller = path.join(
            javaBinPath,
            os.platform() === "win32" ? "java.exe" : "java");
        if (this.javaExecutableFromNodeJavaCaller.includes(" ") && !this.javaExecutableFromNodeJavaCaller.startsWith('"')) {
            this.javaExecutableFromNodeJavaCaller = `"${path.resolve(this.javaExecutableFromNodeJavaCaller)}"`
        }
    }

    fail(reason) {
        console.error(reason);
        this.status = 666;
    }

    addInCache(version, file, java_home, java_bin) {
        if (globalThis.JAVA_CALLER_VERSIONS_CACHE == null) {
            globalThis.JAVA_CALLER_VERSIONS_CACHE = [];
        }
        globalThis.JAVA_CALLER_VERSIONS_CACHE.push({ version, file, java_home, java_bin });
    }
}

module.exports = { JavaCaller };