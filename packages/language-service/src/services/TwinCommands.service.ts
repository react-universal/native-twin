import * as Effect from 'effect/Effect';
// import * as Stream from 'effect/Stream';
import { LSPDocumentsService } from './LSPDocuments.service';

export const make = Effect.gen(function* () {
  const fs = yield* LSPDocumentsService;
  // const fs = yield* Vscode;
});
