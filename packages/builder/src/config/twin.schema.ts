import * as JSONSchema from '@effect/schema/JSONSchema';
import * as Schema from '@effect/schema/Schema';

const logs = Schema.Union(
  Schema.Boolean,
  Schema.Literal('info'),
  Schema.Literal('debug'),
  Schema.Literal('verbose'),
).annotations({
  description: 'Log config',
  identifier: 'log',
  default: false,
  title: 'build logs',
});

const platform = Schema.Union(Schema.Literal('browser'), Schema.Literal('node'));
const minify = Schema.Boolean.annotations({ default: false });
const reactNative = Schema.Boolean.annotations({ default: false });
const types = Schema.Boolean.annotations({ default: true });
const vscode = Schema.Boolean.annotations({ default: false });
const entries = Schema.Array(Schema.String).annotations({ default: ['./src/index.ts'] });

export const twinJSONSchema = JSONSchema.make(
  Schema.Struct({
    $schema: Schema.String,
    logs,
    minify,
    reactNative,
    platform,
    types,
    entries,
    vscode,
  }).annotations({
    title: 'Twin Schema',
    identifier: 'twin',
    description: 'Twin JSON Schema',
    documentation: 'asd',
  }),
);

// const schema = JSON.stringify(twinJSONSchema, null, 2);
// fs.writeFileSync(path.join(process.cwd(), 'build', 'twin.schema.json'), schema);
