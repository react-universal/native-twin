import type * as vscode from 'vscode';
import * as Effect from 'effect/Effect';
import { globalValue } from 'effect/GlobalValue';
import type { TwinTextDocument } from '../language';
import { getVscodeFS } from './fs.utils';

const documentsCache = globalValue(
  Symbol.for('native-twin/stores/documents'),
  () => new WeakMap<object, TwinTextDocument>(),
);

export const make = Effect.gen(function* () {
  const validFileURIs = yield* getVscodeFS;
  const readDocument = (uri: vscode.Uri) => {};
});
