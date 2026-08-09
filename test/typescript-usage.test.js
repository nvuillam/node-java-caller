#! /usr/bin/env node
"use strict";

const { spawnSync } = require("child_process");
const fs = require("fs");
const os = require("os");
const path = require("path");
const { beforeEachTestCase } = require("./helpers/common");

// TypeScript 7 dropped the JS compiler API (require("typescript") only exposes the version),
// so type-checking goes through the tsc CLI, which behaves the same on v5 and v7.
// Its exports map hides ./bin/tsc, hence resolving through package.json (which is exported).
const tsPackageJsonPath = require.resolve("typescript/package.json");
const tscBin = path.join(path.dirname(tsPackageJsonPath), require(tsPackageJsonPath).bin.tsc);

// This test ensures the published TypeScript declarations remain valid for a consumer project.
describe("TypeScript usage", () => {
    beforeEach(beforeEachTestCase);

    it("type-checks a sample consumer", () => {
        const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), "java-caller-ts-"));
        const sourcePath = path.join(tempDir, "example.ts");

        // Paths are absolute: the tsconfig lives outside the project, so nothing resolves relatively.
        const config = {
            compilerOptions: {
                target: "ES2019",
                // node16 rather than CommonJS/Node: TypeScript 7 removed the node10 resolver
                module: "node16",
                moduleResolution: "node16",
                strict: true,
                noEmit: true,
                esModuleInterop: true,
                allowSyntheticDefaultImports: true,
                paths: {
                    "java-caller": [path.join(process.cwd(), "lib/index.d.ts")]
                },
                typeRoots: [path.join(process.cwd(), "node_modules/@types")],
                types: ["node"]
            },
            include: [sourcePath]
        };

        fs.writeFileSync(sourcePath, `import { JavaCaller, JavaCallerOptions, JavaCallerResult } from "java-caller";

const options: JavaCallerOptions = {
    classPath: "test/java/dist",
    mainClass: "com.nvuillam.javacaller.JavaCallerTester",
    minimumJavaVersion: 8,
    javaType: "jre"
};

async function runExample(): Promise<JavaCallerResult> {
    const java = new JavaCaller(options);
    const result = await java.run(["--sleep"], { detached: true, stdoutEncoding: "utf8" });
    if (result.childJavaProcess) {
        result.childJavaProcess.kill("SIGINT");
    }
    return result;
}

async function run(): Promise<void> {
    const result = await runExample();
    const statusText: string = result.status === 0 ? "ok" : "ko";
    console.log(statusText, result.stdout, result.stderr);
}

run();
`);

        const configPath = path.join(tempDir, "tsconfig.json");
        fs.writeFileSync(configPath, JSON.stringify(config, null, 4));

        try {
            const res = spawnSync(process.execPath, [tscBin, "--project", configPath, "--pretty", "false"], {
                encoding: "utf8"
            });

            if (res.status !== 0) {
                throw new Error(`TypeScript compilation failed:\n${res.stdout || ""}${res.stderr || ""}`);
            }
        } finally {
            fs.rmSync(tempDir, { recursive: true, force: true });
        }
    });
});
