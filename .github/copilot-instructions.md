# Native Twin - AI Agent Guidelines

## Project Overview
Native Twin is a monorepo implementing Tailwind CSS for React Native and universal React applications. It uses **Effect-TS** for functional programming patterns and consists of multiple integration layers: Babel plugins, Metro transformer, Vite plugin, TypeScript plugin, and a VS Code extension with Language Server Protocol (LSP).

## Architecture & Key Concepts

### Effect-TS Patterns (Critical)
This codebase is built on **Effect-TS**, not standard Promise-based async. Understanding Effect is essential:

- **Services as Context Tags**: Use `Context.Tag` for dependency injection
  ```typescript
  export class MyService extends Context.Tag('my/service')<MyService, { method: Effect.Effect<Result> }>() {}
  ```
- **Effect.gen**: All async operations use generator-based syntax
  ```typescript
  Effect.gen(function* () {
    const service = yield* MyService;
    const result = yield* service.method();
  })
  ```
- **Layer composition**: Dependencies assembled via `Layer.provideMerge()`, `Layer.provide()`
  - See `packages/compiler/src/Runtime/Main.layer.ts` for canonical example
  - Metro/Vite/Language Server each have their own layer compositions

### Monorepo Structure
- **Compiler Core** (`packages/compiler`): AST transformation, config loading, file system operations
- **Platform Integrations**:
  - `packages/babel`: Babel plugin for build-time transformation
  - `packages/metro`: Metro bundler integration for React Native
  - `packages/vite-plugin`: Vite integration for web builds
  - `packages/jsx`: Runtime JSX processing
- **Developer Tools**:
  - `packages/language-service`: Shared LSP logic (browser + node)
  - `packages/language-server`: Node.js LSP server
  - `packages/ts-plugin`: TypeScript language service plugin
  - `packages/vscode-extension`: VS Code extension wrapper
- **Runtime** (`packages/core`): Runtime style application, theme context
- **CSS Engine** (`packages/css`): Style sheet management, native style generation

### Build System
- **Turbo**: Orchestrates monorepo builds with dependency graph (`turbo.json`)
  - Run `yarn build` to build all packages respecting dependencies
  - Use `turbo run build:watch` for development with watch mode
- **Build Tools**: Mix of esbuild (language-server, vscode-extension) and custom builder (`packages/builder`)
  - Builder uses esbuild with custom config (`esbuild.mjs` files)
- **TypeScript Config**: Packages extend `tsconfig.base.json` with strict mode enabled
  - Use `"module": "NodeNext"` for proper ESM/CJS resolution

## Development Workflows

### Working with the Compiler
1. Changes to `packages/compiler` require rebuild before testing in Metro/Babel
2. Use watch tasks for active development:
   ```bash
   # VS Code tasks available:
   # - "Build watch language server"
   # - "Build watch language service"
   # - "vscode esbuild watch"
   ```
3. Compiler uses Effect-TS layers - provide `MainLayer` or specialized layers like `MetroLayerWithTwinFS`

### Testing Metro/Babel Integration
- Test apps: `apps/expo-app`, `apps/expo-router`
- Metro config uses `withNativeTwin()` wrapper (see `apps/expo-app/metro.config.js`)
- Babel config requires:
  ```javascript
  presets: [
    ['babel-preset-expo', { jsxImportSource: '@native-twin/jsx' }]
  ]
  ```

### Language Server Development
- **Browser context**: `packages/language-service/src/browser.ts` exports for Monaco/web
- **Node context**: `packages/language-server` wraps service for VS Code
- Both share core logic via Effect-TS services (`LSPConnectionService`, `LSPDocumentsService`, `NativeTwinManagerService`)
- VS Code extension (`packages/vscode-extension`) launches language client with connection to server worker

### Adding New Features
1. **Core utilities**: Add to `packages/helpers` (shared utilities) or `packages/css` (style operations)
2. **Compiler transformations**: Modify AST traversal in `packages/compiler/src/Programs/twinTransform.program.ts`
3. **LSP features**: Implement in `packages/language-service/src/programs/` and expose via language server handlers
4. **Config options**: Extend types in `packages/compiler/src/Config/Models.ts` and handle in `CompilerConfigContext`

## Project-Specific Conventions

### File Naming
- **Services**: `*.service.ts` exports Context tags and implementations
- **Layers**: `*.layer.ts` assembles Effect layers
- **Programs**: `*.program.ts` contains main Effect programs/workflows
- **Models**: `*.model.ts` or `*.models.ts` for types and interfaces

### Import Patterns
- Use workspace protocol: `"@native-twin/compiler": "workspace:*"`
- Effect imports: Always import from `effect/Effect`, `effect/Layer`, etc. (not default exports)
- Babel/AST: Import types from `@babel/types` as `import type * as t from '@babel/types'`

### Testing
- Vitest for most packages: `npx vitest` (see `packages/compiler/test/`)
- Use `@effect/vitest` for Effect-aware assertions
- Test files mirror src structure in `test/` directories

### Configuration Files
- Tailwind configs in each app: `tailwind.config.ts` using `defineConfig()` from `@native-twin/core`
- Metro requires `inputCSS` path and `twinConfigPath` in `withNativeTwin()` options
- VS Code extension reads twin config via `getConfigFiles` service

## Common Patterns

### Loading Twin Config
```typescript
const twinConfigRef = yield* SubscriptionRef.make(extractTwinConfig(env.twinConfigPath));
```

### AST Transformation Flow
1. Parse with Babel → `babelParse()` in `packages/compiler/src/utils/babel/babel.parser.ts`
2. Extract regions → `extractLanguageRegions()` for template literals/JSX
3. Transform → `twinTransformProgram()` generates styles and mutates AST
4. Output → Emit CSS to platform-specific paths

### Platform-Specific Builds
- Compiler tracks platforms via `runningPlatformsRef` (web/native)
- Style sheets maintain separate runners per platform (`twRunnersRef`)
- Metro transformer detects platform from options: `options.platform ?? 'native'`

## Integration Points

### Metro Transformer
Entry: `packages/metro/src/programs/metro.transformer.ts`
- Wraps Metro's default transformer
- Intercepts allowed paths (from twin config `content` globs)
- Handles CSS output injection for generated styles

### Babel Plugin
Entry: `packages/babel/src/index.ts`
- Runs at compile time in Babel pipeline
- Requires `jsxImportSource: '@native-twin/jsx'` preset option
- Mutates AST to inject style processing

### VS Code Extension
Entry: `packages/vscode-extension/src/extension.ts`
- Launches Effect program with `launchExtension(MainLive)`
- Provides language client, tree data providers, syntax highlighting
- Uses shared `@native-twin/language-service` via worker

## Troubleshooting

- **Build failures**: Ensure compiler built first (`cd packages/compiler && yarn build`)
- **Effect type errors**: Check Layer.provide order - dependencies must be provided before consumers
- **Metro transform issues**: Verify `allowedPaths` globs match your content files
- **Language server not starting**: Check `log.configuration.json` and output channel in VS Code
- **Monorepo resolution**: Metro requires `nodeModulesPaths` config for proper workspace resolution

## Key Files Reference
- Main compiler layer: `packages/compiler/src/Runtime/Main.layer.ts`
- Compiler config service: `packages/compiler/src/Config/Service.ts`
- Metro transformer: `packages/metro/src/programs/metro.transformer.ts`
- Language service exports: `packages/language-service/src/browser.ts`
- VS Code activation: `packages/vscode-extension/src/extension.ts`
- Build orchestration: `turbo.json`
