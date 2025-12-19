// import * as Context from 'effect/Context';
// import type * as Mailbox from 'effect/Mailbox';
// import type * as t from 'vscode-languageserver-types';
// import * as Effect from 'effect/Effect';
// import * as HashSet from 'effect/HashSet';
// import * as Layer from 'effect/Layer';
// import * as Option from 'effect/Option';
// import * as PubSub from 'effect/PubSub';
// import type * as Queue from 'effect/Queue';
// import * as Ref from 'effect/Ref';
// import * as Schema from 'effect/Schema';
// import type * as Scope from 'effect/Scope';
// import * as SubscriptionRef from 'effect/SubscriptionRef';
// import { LSPConstants, TwinDiagnosticCodes } from '../browser';

// export interface VFSFileClient {
//   readonly id: number;
//   readonly uri: t.URI;
//   readonly diagnostics: Effect.Effect<Queue.Dequeue<Response.Diagnostic>, never, Scope.Scope>;
//   readonly regions: Effect.Effect<Queue.Dequeue<RangeResponse>, never, Scope.Scope>;
// }

// export interface DocumentsHandler {
//   queue: Mailbox.ReadonlyMailbox<Request>;
//   request: Mailbox.ReadonlyMailbox<Request>;
// }


// const DiagnosticRequest = Schema.Struct({
//   _tag: Schema.Literal('Diagnostics'),
//   uri: Schema.String.pipe(Schema.nonEmptyString()),
// });

// const RangeResponse = Schema.Struct({
//   _tag: Schema.Literal('Range'),
//   startOffset: Schema.Number,
//   endOffset: Schema.Number,
// });
// export type RangeResponse = Schema.Schema.Type<typeof RangeResponse>;

// export const DiagnosticItem = Schema.Struct({
//   _tag: Schema.Literal('DiagnosticItem'),
//   range: RangeResponse,
//   code: Schema.Literal(
//     TwinDiagnosticCodes.DuplicatedClassName,
//     TwinDiagnosticCodes.DuplicatedDeclaration,
//   ),
// });
// export const DiagnosticResponse = Schema.Struct({
//   _tag: Schema.Literal('Diagnostics'),
//   uri: Schema.String.pipe(Schema.nonEmptyString()),
//   diagnostics: Schema.Array(DiagnosticItem),
// });

// export const Request = Schema.Union(DiagnosticRequest);
// export type Request = Schema.Schema.Type<typeof Request>;

// export const Response = Schema.Union(DiagnosticResponse);
// export type Response = Schema.Schema.Type<typeof Response>;

// export declare namespace Response {
//   /**
//    * @since 1.0.0
//    * @category schemas
//    */
//   export type Diagnostic = Extract<Response, { readonly _tag: 'Diagnostics' }>;
// }


// export const makeClientServer = Effect.fn(function* () {
//   conat queue 
//   yield* Effect.void;
// });