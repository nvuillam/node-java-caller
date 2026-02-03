/// <reference types="node" />

import type { ChildProcess } from "child_process";

/**
 * Options for JavaCaller constructor
 */
export interface JavaCallerOptions {
    /**
     * Path to executable jar file
     */
    jar?: string;
    
    /**
     * If jar parameter is not set, classpath to use.
     * Use : as separator (it will be converted if run on Windows), or use a string array.
     */
    classPath?: string | string[];
    
    /**
     * Set to true if classpaths should not be based on the rootPath
     */
    useAbsoluteClassPaths?: boolean;
    
    /**
     * If classPath set, main class to call
     */
    mainClass?: string;
    
    /**
     * Minimum java version to be used to call java command.
     * If the java version found on machine is lower, java-caller will try to install and use the appropriate one
     * @default 8 (11 on macOS)
     */
    minimumJavaVersion?: number;
    
    /**
     * Maximum java version to be used to call java command.
     * If the java version found on machine is upper, java-caller will try to install and use the appropriate one
     */
    maximumJavaVersion?: number;
    
    /**
     * jre or jdk (if not defined and installation is required, jre will be installed)
     */
    javaType?: "jre" | "jdk";
    
    /**
     * If classPath elements are not relative to the current folder, you can define a root path.
     * You may use __dirname if you classes / jars are in your module folder
     * @default "." (current folder)
     */
    rootPath?: string;
    
    /**
     * You can force to use a defined java executable, instead of letting java-caller find/install one.
     * Can also be defined with env var JAVA_CALLER_JAVA_EXECUTABLE
     */
    javaExecutable?: string;
    
    /**
     * Additional parameters for JVM that will be added in every JavaCaller instance runs
     */
    additionalJavaArgs?: string[];
    
    /**
     * Output mode: "none" or "console"
     * @default "none"
     */
    output?: "none" | "console";
}

/**
 * Options for JavaCaller run method
 */
export interface JavaCallerRunOptions {
    /**
     * If set to true, node will not wait for the java command to be completed.
     * In that case, childJavaProcess property will be returned, but stdout and stderr may be empty
     * @default false
     */
    detached?: boolean;
    
    /**
     * Adds control on spawn process stdout
     * @default "utf8"
     */
    stdoutEncoding?: string;
    
    /**
     * If detached is true, number of milliseconds to wait to detect an error before exiting JavaCaller run
     * @default 500
     */
    waitForErrorMs?: number;
    
    /**
     * You can override cwd of spawn called by JavaCaller runner
     * @default process.cwd()
     */
    cwd?: string;
    
    /**
     * List of arguments for JVM only, not the JAR or the class
     */
    javaArgs?: string[];
    
    /**
     * No quoting or escaping of arguments is done on Windows. Ignored on Unix.
     * This is set to true automatically when shell is specified and is CMD.
     * @default true
     */
    windowsVerbatimArguments?: boolean;
    
    /**
     * If windowless is true, JavaCaller calls javaw instead of java to not create any windows,
     * useful when using detached on Windows. Ignored on Unix.
     * @default false
     */
    windowless?: boolean;
}

/**
 * Result returned by JavaCaller run method
 */
export interface JavaCallerResult {
    /**
     * Exit status code of the java command
     */
    status: number | null;
    
    /**
     * Standard output of the java command
     */
    stdout: string;
    
    /**
     * Standard error output of the java command
     */
    stderr: string;
    
    /**
     * Child process object (useful when detached is true)
     */
    childJavaProcess?: ChildProcess;
}

/**
 * JavaCaller class for calling Java commands from Node.js
 */
export class JavaCaller {
    minimumJavaVersion: number;
    maximumJavaVersion?: number;
    javaType?: "jre" | "jdk";
    rootPath: string;
    jar?: string;
    classPath: string | string[];
    useAbsoluteClassPaths: boolean;
    mainClass?: string;
    output: string;
    status: number | null;
    javaSupportDir?: string;
    javaExecutable: string;
    javaExecutableWindowless: string;
    additionalJavaArgs: string[];
    commandJavaArgs: string[];
    javaHome?: string;
    javaBin?: string;
    javaExecutableFromNodeJavaCaller?: string | null;
    prevPath?: string;
    prevJavaHome?: string;
    
    /**
     * Creates a JavaCaller instance
     * @param opts - Run options
     */
    constructor(opts: JavaCallerOptions);
    
    /**
     * Runs java command of a JavaCaller instance
     * @param userArguments - Java command line arguments
     * @param runOptions - Run options
     * @returns Command result (status, stdout, stderr, childJavaProcess)
     */
    run(userArguments?: string[], runOptions?: JavaCallerRunOptions): Promise<JavaCallerResult>;
}

/**
 * JavaCallerCli class for using java-caller from command line
 */
export class JavaCallerCli {
    javaCallerOptions: JavaCallerOptions;
    
    /**
     * Creates a JavaCallerCli instance
     * @param baseDir - Base directory containing java-caller-config.json
     */
    constructor(baseDir: string);
    
    /**
     * Process command line arguments and run java command
     */
    process(): Promise<void>;
}
