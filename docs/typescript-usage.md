# TypeScript Support Example

This example demonstrates how to use java-caller with TypeScript, including strict mode compatibility.

## Setup

```bash
npm install java-caller typescript @types/node
```

## Usage

### Basic TypeScript Example

```typescript
import { JavaCaller, JavaCallerOptions } from "java-caller";

// Define options with full type safety
const options: JavaCallerOptions = {
    classPath: 'java/MyApp.jar',
    mainClass: 'com.example.MyApp',
    minimumJavaVersion: 11,
    javaType: "jre"
};

// Create instance with autocomplete support
const java = new JavaCaller(options);

// Run with type-safe result
const result = await java.run(['-arg1', 'value']);
console.log(`Status: ${result.status}`);
console.log(`Output: ${result.stdout}`);
```

### Strict Mode Compatibility

The type definitions are fully compatible with TypeScript's strict mode:

```typescript
// tsconfig.json
{
  "compilerOptions": {
    "strict": true,
    "noImplicitAny": true,
    "strictNullChecks": true
  }
}
```

### ES Module Import

```typescript
import { JavaCaller, JavaCallerCli } from "java-caller";
```

### CommonJS Require

```typescript
const { JavaCaller, JavaCallerCli } = require("java-caller");
```

Both import styles work with full TypeScript support!
