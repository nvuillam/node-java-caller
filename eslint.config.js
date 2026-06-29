const js = require("@eslint/js");
const globals = require("globals");
const babelParser = require("@babel/eslint-parser");

// Flat config (ESLint 9+). Faithful translation of the previous .eslintrc.js.
module.exports = [
    {
        // TypeScript declaration files are not linted by this JS config
        // (the project's lint script only targets *.js). MegaLinter's
        // TYPESCRIPT_ES handles .d.ts separately.
        ignores: ["**/*.d.ts"],
    },
    js.configs.recommended,
    {
        files: ["**/*.js", "**/*.jsx"],
        languageOptions: {
            ecmaVersion: 2018,
            sourceType: "module",
            parser: babelParser,
            parserOptions: {
                requireConfigFile: false,
                babelOptions: {
                    parserOpts: {
                        plugins: ["typescript"],
                    },
                },
            },
            globals: {
                ...globals.browser,
                ...globals.node,
                Atomics: "readonly",
                SharedArrayBuffer: "readonly",
                globalThis: "readonly",
                describe: true,
                it: true,
                beforeEach: true,
            },
        },
        rules: {
            indent: "off", // Managed by prettier
        },
    },
];
