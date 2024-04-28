import * as Context from 'effect/Context';
import * as Effect from 'effect/Effect';
import * as Layer from 'effect/Layer';
import { Project, ts } from 'ts-morph';

export class TypescriptService extends Context.Tag('ts/template')<
  TypescriptService,
  {
    ts: typeof ts;
    project: Project;
  }
>() {
  static Live = Layer.scoped(
    TypescriptService,
    Effect.sync(() => {
      const project = new Project();
      const exists = project.getFileSystem().fileExists('/tailwind.config.ts');

      return {
        ts,
        project,
        exists,
      };
    }),
  );
}
