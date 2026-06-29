const js = require("@eslint/js");
const globals = require("globals");

// Flat config (ESLint 9+). Plain Node ES2021 sources; default espree parser.
module.exports = [
  {
    // TypeScript declaration files are hand-maintained and covered by
    // prettier; eslint's JS rules don't apply to .d.ts.
    // coverage/ and node_modules/ are generated/vendored and not linted.
    ignores: ["**/*.d.ts", "coverage/**", "node_modules/**"],
  },
  js.configs.recommended,
  {
    files: ["**/*.js", "**/*.jsx"],
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: "commonjs",
      globals: {
        ...globals.browser,
        ...globals.node,
        Atomics: "readonly",
        SharedArrayBuffer: "readonly",
        globalThis: "readonly",
        describe: true,
        it: true,
        before: true,
        after: true,
        beforeEach: true,
        afterEach: true,
      },
    },
    rules: {
      indent: "off", // Managed by prettier
    },
  },
];
