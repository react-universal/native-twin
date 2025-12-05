/// <reference lib="WebWorker" />

import * as Runner from '@effect/platform/WorkerRunner';
import * as BrowserRunner from '@effect/platform-browser/BrowserWorkerRunner';
import * as Effect from 'effect/Effect';
import * as Layer from 'effect/Layer';
import * as Stream from 'effect/Stream';
import sucrase from 'sucrase';
import { CompileCodeRequestSchema, CompiledCodeResponse } from './shared.schemas';

const jsxConst = 'const _jsxFileName = "";';
const trimCode = (code: string) => code.trim().replace(/;$/, '');
const spliceJsxConst = (code: string) => code.replace(jsxConst, '').trim();
const addJsxConst = (code: string) => jsxConst + code;
const wrapReturn = (code: string) => `return (${code})`;

const WorkerLive = Runner.layerSerialized(CompileCodeRequestSchema, {
  CompileCodeRequestSchema: (req) => {
    console.log('REQ: ', req);
    const code = addJsxConst(req.jsx);
    const transformed = sucrase.transform(code, { transforms: ['imports'] });
    console.log('IMPORTS: ', transformed.code);
    const spliced = spliceJsxConst(transformed.code);
    const trimmed = trimCode(spliced);
    const tsTransform = sucrase.transform(trimmed, { transforms: ['jsx', 'typescript'] });
    console.log('ts_transform: ', tsTransform.code);
    const wrapped = wrapReturn(tsTransform.code);
    const compiled = trimCode(wrapped);

    return Stream.make(compiled).pipe(
      Stream.map((x) => CompiledCodeResponse.make({ css: '', js: x })),
      Stream.tapError((error) => Effect.log('Error on worker: ', error)),
    );
  },
}).pipe(Layer.provide(BrowserRunner.layer));

Effect.runFork(Layer.launch(WorkerLive));
