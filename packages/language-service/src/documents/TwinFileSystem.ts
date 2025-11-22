// import { Effect } from 'effect';
// import * as Spec from '../internal/LSPAdapterSpec';
// import ts from 'typescript';
// import { TwinLSPDocument } from './node/TwinLSPDocument.model';

// export interface LSPFileSystem {
//   readFile: (url: string) => Effect.Effect<string>;
//   readDir: (path: string) => Effect.Effect<string>;
//   fileExists: (path: string) => Effect.Effect<boolean>;
//   tsHost: (path: string) => Effect.Effect<ts.ProgramHost<ts.BuilderProgram>>;
// }

// const make = Effect.gen(function* () {
//   const twinDocs = yield* TwinLSPDocument;
// });
