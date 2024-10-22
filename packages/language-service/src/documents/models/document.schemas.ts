import * as Schema from 'effect/Schema';

export const VsCodePosition = Schema.Struct({
  character: Schema.Int,
  line: Schema.Int,
});

export const VsCodeRangeSchema = Schema.Struct({
  start: VsCodePosition,
  end: VsCodePosition,
});
