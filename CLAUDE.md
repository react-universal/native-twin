# CLAUDE.md

- In all interactions and commit messages, be extremely concise and sacrifice grammar for the sake of concision.

## Project Overview

**Native Twin** 

is a sophisticated monorepo that brings Tailwind CSS to React Native with full state support (hover, active, focus) and universal component capabilities. It enables React web developers to write components once and deploy to both web and native platforms.

**Key Technologies:**

- TypeScript 5.9.3, React 19, React Native 0.81.5
- Yarn 4.6.0 (workspace), Turbo 2.5.8 (build orchestration)
- Effect-TS 3.18.4 (functional effects library)
- Babel, Metro, Vite, Next.js integrations
- VS Code Language Server Protocol (LSP) integration

## Essential Commands

### Build & Development
```bash
yarn build                    # Full monorepo build via Turbo
yarn build:watch             # Watch mode for incremental builds
yarn clean                   # Clean all build artifacts

yarn lint                    # Lint all packages with Biomejs
yarn test                    # Run all tests via Vitest
yarn format                  # Format code with Prettier

yarn check-deps              # Verify dependency tree (knip)
```

### Running Examples
```bash
yarn example:expo            # Start Expo React Native example
yarn nextjs:pages:dev        # Start Next.js Pages Router example
yarn docs:build              # Build documentation site
```

### Development Tools
```bash
yarn extension:dev           # Launch VS Code extension in dev mode
yarn build:release           # Package all libraries for release
```

### Workspace Operations
```bash
yarn libs:foreach pack       # Package all libraries
yarn libs:foreach exec       # Execute command in all libraries
```

## Monorepo Structure

### Core Packages (20 packages in `/packages`)

**Compilation & Build:**
- `@native-twin/compiler` - Babel plugin and build-time compilation infrastructure
- `@native-twin/babel` - Babel plugin wrapper
- `@native-twin/metro` - Metro bundler integration for React Native
- `@native-twin/vite-plugin` - Vite integration for web builds

**Runtime & Styling:**
- `@native-twin/core` - Main API (setup, createVariants, cx, theme)
- `@native-twin/jsx` - Custom JSX runtime and transform
- `@native-twin/css` - CSS parser and React Native StyleSheet conversion
- `@native-twin/preset-tailwind` - Tailwind CSS utilities and presets

**Parsing & Transformation:**
- `@native-twin/arc-parser` - Parser combinators library for DSL syntax
- `@native-twin/data-types` - Shared type definitions

**Shared Utilities:**
- `@native-twin/helpers` - Utility functions (fp, KeyMap, react, server, tree)
- `@native-twin/builder` - Style building utilities

**Framework Adapters:**
- `@native-twin/adapters` - Next.js App Router, Pages Router adapters
- `@native-twin/styled` - Styled components API (legacy, favored over)

**IDE & Developer Experience:**
- `@native-twin/language-service` - LSP implementation and IDE features
- `@native-twin/language-server` - Node.js LSP server
- `@native-twin/ts-plugin` - TypeScript language service plugin
- `@native-twin/vscode-extension` - VS Code extension
- `@native-twin/dev-tools` - Development utilities and Web UI

### Key Directories
- `/apps` - Example applications (Expo, Next.js Pages/App Router)
- `/sites` - Documentation websites
- `/scripts` - Build and utility scripts

## Architecture & Data Flow

### Build-Time Processing Pipeline

```
User Code (JSX/TS)
    ↓
Babel Plugin (@native-twin/babel)
    ↓
Compiler (@native-twin/compiler)
    ├→ Arc Parser: Parse grouping syntax (sm:(...))
    ├→ CSS Parser: Convert to React Native styles
    └→ AST Transform: Inject style processing
    ↓
StyleSheet.create()
    ↓
Platform-Specific Output (CJS, ESM, DTS)
```

### Key Integration Points

**Metro Transformer** (`packages/metro/src/programs/metro.transformer.ts`)
- Wraps Metro's default transformer
- Intercepts files matching `tailwind.config.ts` `content` globs
- Handles CSS output injection for generated styles

**Babel Plugin** (`packages/babel/src/index.ts`)
- Runs during compilation pipeline
- Requires `jsxImportSource: '@native-twin/jsx'` in Babel preset
- Mutates AST to inject style processing

**Language Server** (`packages/language-service`, `packages/language-server`)
- Implements Language Server Protocol
- Provides IDE features: autocomplete, diagnostics, color picker
- Integrates TypeScript plugin and CSS language service

**VS Code Extension** (`packages/vscode-extension/src/extension.ts`)
- Launches via Effect program with `launchExtension(MainLive)`
- Communicates with language server for IDE features
- Provides file visualization, compile commands, workspace initialization

## Effect-TS Patterns (Critical)

This codebase uses **Effect-TS** extensively. Understanding Effect is essential:

### Service Definition
```typescript
import { Context } from 'effect';

export class MyService extends Context.Tag('namespace/service')<MyService, {
  method: Effect.Effect<Result>;
}>() {}
```

### Using Services (Effect.gen)
```typescript
Effect.gen(function* () {
  const service = yield* MyService;
  const result = yield* service.method();
  return result;
})
```

### Layer Composition
```typescript
// Combine multiple service layers
const layer = Layer.provideMerge(serviceALayer, serviceBLayer);

// Provide context to program
const program = Effect.gen(function* () { ... });
const result = yield* program.pipe(
  Effect.provide(layer),
  Effect.runSync
);
```

### Canonical Examples
- Main compiler layer: `packages/compiler/src/Runtime/Main.layer.ts`
- Service implementations: Files named `*.service.ts`
- Layer compositions: Files named `*.layer.ts`
- Programs/workflows: Files named `*.program.ts`

## File Naming Conventions

- `*.service.ts` - Services exporting Context tags and implementations
- `*.layer.ts` - Effect layer compositions
- `*.program.ts` - Main Effect programs/workflows
- `*.models.ts` or `*.model.ts` - Type definitions and interfaces
- `*.test.ts` - Test files (mirror src structure in test/)

## Development Workflows

### Adding Compiler Features
1. Modify AST in `packages/compiler/src/Programs/twinTransform.program.ts`
2. Update config types in `packages/compiler/src/Config/Models.ts`
3. Handle config in `CompilerConfigContext`
4. Rebuild: `cd packages/compiler && yarn build`
5. Test in Metro/Babel integration

### Adding IDE Features
1. Implement in `packages/language-service/src/programs/`
2. Expose via language server handlers
3. Test in VS Code extension with `yarn extension:dev`

### Testing
```bash
# Run all tests
yarn test

# Run single package tests
cd packages/compiler && npx vitest

# Watch mode for package
cd packages/compiler && npx vitest --watch
```

Use `@effect/vitest` for Effect-aware assertions. Test files mirror src structure in `test/` directories.

## Configuration

### Tailwind Configuration
Users create `tailwind.config.ts` in project root using `defineConfig()` from `@native-twin/core`:

```typescript
import { defineConfig } from '@native-twin/core';
import { presetTailwind } from '@native-twin/preset-tailwind';

export default defineConfig({
  mode: 'native', // or 'web'
  theme: {
    extend: { /* custom theme */ }
  },
  presets: [presetTailwind()],
});
```

### Metro Configuration
```javascript
const { withNativeTwin } = require('@native-twin/metro');

module.exports = withNativeTwin(config, {
  configPath: path.join(__dirname, 'tailwind.config.ts'),
  inputCSS: 'global.css',
});
```

### Babel Configuration
```javascript
presets: [
  ['babel-preset-expo', { jsxImportSource: '@native-twin/jsx' }],
  ['@native-twin/babel/babel', {
    twinConfigPath: './tailwind.config.ts',
    cssInput: 'globals.css',
  }],
]
```

## Build System (Turbo)

**Key Turbo Tasks:**
- `build` - Full build with dependency caching (depends on `build:compiler`)
- `build:watch` - Persistent watch mode for development
- `build:compiler` - Compiler packages build first (highest priority)
- `test` - Tests depend on prior `build`
- `lint` - Cached linting with Biomejs

**Running Tasks:**
```bash
yarn build                           # Full build
npx turbo run build:watch --parallel # Watch all packages
npx turbo run test --only core       # Test only core package
```

## Common Patterns & Code References

### Loading Twin Configuration
```typescript
const twinConfigRef = yield* SubscriptionRef.make(
  extractTwinConfig(env.twinConfigPath)
);
```

### Platform-Specific Styling
Compiler tracks platforms via `runningPlatformsRef` (web/native). Style sheets maintain separate runners per platform (`twRunnersRef`). Metro transformer detects platform from options: `options.platform ?? 'native'`.

### AST Transformation Flow
1. Parse: `babelParse()` from `packages/compiler/src/utils/babel/babel.parser.ts`
2. Extract regions: `extractLanguageRegions()` for template literals/JSX
3. Transform: `twinTransformProgram()` generates styles and mutates AST
4. Output: Emit CSS to platform-specific paths

## Key Service Reference

| Service | Location | Purpose |
|---------|----------|---------|
| `CompilerConfigContext` | `packages/compiler/src/Config/Service.ts` | Configuration management |
| `MainLayer` | `packages/compiler/src/Runtime/Main.layer.ts` | Compiler layer composition |
| `LSPConnectionService` | `packages/language-service` | LSP protocol handler |
| `NativeTwinManagerService` | `packages/language-service` | Twin project management |
| `MetroLayerWithTwinFS` | `packages/metro` | Metro-specific layer |

## Dependency Management

### Workspace Protocol
All internal dependencies use: `"@native-twin/package": "workspace:*"`

### Critical External Dependencies
- `effect@3.18.4` - Functional effects and dependency injection
- `typescript@5.9.3` - Language and type checking
- `@babel/core` - AST transformation
- `vscode-languageserver` - LSP server framework
- `lightningcss` - CSS parsing

### TypeScript Configuration
- Target: ES2022
- Module: NodeNext (proper ESM/CJS resolution)
- Strict mode: Enabled
- Base config: `tsconfig.base.json` (path aliases per package)
- Declaration files: Generated (.d.ts in build/)

## Troubleshooting

| Issue | Solution |
|-------|----------|
| Build failures | Ensure compiler built first: `cd packages/compiler && yarn build` |
| Effect type errors | Check Layer.provide order - dependencies must be provided before consumers |
| Metro transform issues | Verify `allowedPaths` globs match your content files |
| Language server not starting | Check logs in VS Code output channel, verify LSP connection |
| Monorepo resolution | Metro needs `nodeModulesPaths` config for workspace packages |
| Type errors in compiler | Run `yarn build:compiler` to regenerate types in dependent packages |

## Git Workflow

**Current Branch:** `next` (development branch)
**Main Branch:** `main` (production releases)

**Recent Focus:** LSP/TypeScript DSL enhancements, data-types package creation

When making commits:
1. Use meaningful commit messages following Commitizen conventions
2. Ensure all tests pass: `yarn test`
3. Run linter: `yarn lint`
4. Verify no dependency issues: `yarn check-deps`

## Important Notes

- **Near-zero runtime overhead** is a core design principle - optimize for compile-time processing
- **Effect-TS is pervasive** - understand generator-based async patterns and Layer composition
- **Monorepo dependencies matter** - Turbo task order (especially `build:compiler` first) is critical
- **Platform separation** - Web and Native have distinct style generation and transformation paths
- **LSP integration** - Multiple packages collaborate (language-service, language-server, vscode-extension)
