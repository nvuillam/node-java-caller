#! /usr/bin/env node
"use strict";

const fs = require("fs");
const os = require("os");
const path = require("path");
const ts = require("typescript");
const { beforeEachTestCase } = require("./helpers/common");

// This test ensures the published TypeScript declarations remain valid for a consumer project.
describe("TypeScript usage", () => {
    beforeEach(beforeEachTestCase);

    it("type-checks a sample consumer", () => {
        const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), "java-caller-ts-"));
        const sourcePath = path.join(tempDir, "example.ts");

        const config = {
            compilerOptions: {
                target: "ES2019",
                module: "CommonJS",
                moduleResolution: "Node",
                strict: true,
                esModuleInterop: true,
                allowSyntheticDefaultImports: true,
                baseUrl: process.cwd(),
                paths: {
                    "java-caller": ["lib/index.d.ts"]
                },
                types: ["node"]
            },
            include: ["example.ts"]
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

        try {
            const parsed = ts.parseJsonConfigFileContent(config, ts.sys, tempDir);
            const program = ts.createProgram({ rootNames: parsed.fileNames, options: parsed.options });
            const diagnostics = ts.getPreEmitDiagnostics(program);

            if (diagnostics.length) {
                const formatted = diagnostics
                    .map(diag => {
                        if (diag.file && typeof diag.start === "number") {
                            const { line, character } = diag.file.getLineAndCharacterOfPosition(diag.start);
                            const message = ts.flattenDiagnosticMessageText(diag.messageText, "\n");
                            return `${diag.file.fileName} (${line + 1},${character + 1}): ${message}`;
                        }
                        return ts.flattenDiagnosticMessageText(diag.messageText, "\n");
                    })
                    .join("\n");
                throw new Error(`TypeScript compilation failed:\n${formatted}`);
            }
        } finally {
            fs.rmSync(tempDir, { recursive: true, force: true });
        }
    });
});
