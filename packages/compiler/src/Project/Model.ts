import { SheetEntryHandler } from '@native-twin/css/jsx';
import type * as Tree from '@native-twin/helpers/tree';
import * as RA from 'effect/Array';
import * as Effect from 'effect/Effect';
import * as HashMap from 'effect/HashMap';
import type * as Option from 'effect/Option';
import * as Ref from 'effect/Ref';
import * as Stream from 'effect/Stream';
import type {
  JSXMappedAttribute,
  TwinBabelModule,
  TwinJSXElement,
  TwinJSXElementNode,
} from '../Babel';
import type { TwinPath } from '../FileSystem';
import { type CompilerStyleSheet, ComponentStyledProp } from '../StyleSheet';
import { mapTreeEffect } from '../utils/tree.utils';

export type TwinRunnerPlatform = 'web' | 'native';

export class ModulesHandler {
  get: Effect.Effect<HashMap.HashMap<TwinPath.FilePath, TwinBabelModule>>;
  add: (module: TwinBabelModule) => Effect.Effect<void>;
  delete: (filepath: TwinPath.FilePath) => Effect.Effect<boolean>;
  find: (filepath: TwinPath.FilePath) => Effect.Effect<Option.Option<TwinBabelModule>>;

  constructor(
    private value: Ref.Ref<HashMap.HashMap<TwinPath.FilePath, TwinBabelModule>>,
  ) {
    this.get = Ref.get(this.value);
    this.find = (filepath) => Effect.map(this.value, HashMap.get(filepath));

    this.add = (babelModule) =>
      Ref.update(this.value, HashMap.set(babelModule.file.path, babelModule));

    this.delete = (filepath) =>
      Effect.andThen(
        Ref.updateAndGet(this.value, HashMap.remove(filepath)),
        HashMap.has(filepath),
      );
  }

  toStream() {
    return Stream.fromIterableEffect(this.get);
  }

  run(extractor: TwinExtractor) {
    return Effect.andThen(
      this.get,
      HashMap.map((module) => new PlatformModule(module, extractor)),
    );
  }
}

export class PlatformModule {
  constructor(
    private module: TwinBabelModule,
    private extractor: TwinExtractor,
  ) {}

  toPlatform(platform: TwinRunnerPlatform) {
    return Stream.fromIterable(this.module.jsxElements).pipe(
      Stream.mapEffect((element) =>
        Effect.andThen(
          this.extractor.getCompiledTree(element, platform),
          (tree) => new CompiledTwinJSXElement(element, tree),
        ),
      ),
      Stream.runCollect,
    );
  }
}

export class TwinExtractor {
  get: Effect.Effect<Extractors>;
  getExtractor: (platform: 'web' | 'native') => Effect.Effect<CompilerStyleSheet>;
  getStyledProps: (
    props: JSXMappedAttribute[],
    platform: 'web' | 'native',
  ) => Effect.Effect<ComponentStyledProp[]>;

  constructor(private value: Ref.Ref<Extractors>) {
    this.get = Ref.get(this.value);
    this.getExtractor = (platform: 'native' | 'web') =>
      Effect.andThen(this.get, ({ native, web }) =>
        platform === 'native' ? native : web,
      );

    this.getStyledProps = (props, platform) =>
      Effect.andThen(this.getExtractor(platform), (compiler) =>
        props.map((prop) => {
          const handlers = RA.map(
            compiler.twinFn(prop.value.text),
            (x) => new SheetEntryHandler(x, compiler.ctx),
          );
          return new ComponentStyledProp(prop, handlers);
        }),
      );
  }

  getCompiledTree(jsxElement: TwinJSXElement, platform: TwinRunnerPlatform) {
    return mapTreeEffect(jsxElement.tree, (node) =>
      Effect.map(
        this.getStyledProps(node.value.styledProps, platform),
        (compiledProps) => new CompiledTwinNodeElement(node.value, compiledProps),
      ),
    );
  }
}

export class CompiledTwinJSXElement {
  constructor(
    readonly twinElement: TwinJSXElement,
    readonly tree: Tree.Tree<CompiledTwinNodeElement>,
  ) {}
}

export class CompiledTwinNodeElement {
  constructor(
    readonly twinJsxNode: TwinJSXElementNode,
    readonly styledProps: ComponentStyledProp[],
  ) {}
}

interface Extractors {
  native: CompilerStyleSheet;
  web: CompilerStyleSheet;
}
