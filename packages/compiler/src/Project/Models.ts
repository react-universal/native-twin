import traverse from '@babel/traverse';
import type { NodePath } from '@babel/traverse';
import * as t from '@babel/types';
import * as Chunk from 'effect/Chunk';
import * as Hash from 'effect/Hash';
import * as Option from 'effect/Option';
import * as Schema from 'effect/Schema';
import * as Stream from 'effect/Stream';
import * as TwinPath from '../FileSystem/Path.model';
import { isLocalImport, resolveDeclarator } from '../Resolver/Utils';
import { type BabelParseResult, babelParse } from '../utils/babel/babel.parser';
import {
  type JSXElementFunction,
  funcJSXElementFunction,
} from '../utils/babel/babel.utils';

export class ModuleDependency extends Schema.Class<ModuleDependency>('ModuleDependency')({
  originalSource: Schema.String,
  filepath: TwinPath.AbsolutePath,
  isLocal: Schema.Boolean,
  localName: Schema.String,
  exportName: Schema.String,
}) {
  get fromReactNative() {
    return this.originalSource === 'react-native';
  }
}

export class ProjectModule {
  private _ast: BabelParseResult;
  private readonly _rootComponents: Stream.Stream<NodePath<t.JSXElement>>;
  private readonly _dependencies: ModuleDependency[];
  /** Component definitions in module */
  readonly definitions: Stream.Stream<JSXElementDeclaration>;

  get id() {
    return `${this.name}:${Hash.string(this.filepath)}`;
  }
  get name() {
    return TwinPath.NodePath.basename(this.filepath);
  }
  get dirname() {
    return TwinPath.absolutePathFromString(TwinPath.NodePath.dirname(this.filepath));
  }
  get isJSX() {
    return this.name.endsWith('.tsx') || this.name.endsWith('.jsx');
  }
  get dependencies() {
    return this._dependencies;
  }

  constructor(
    readonly filepath: TwinPath.FilePath,
    readonly code: string,
  ) {
    this._ast = babelParse(code, filepath);
    this._rootComponents = getRootJSXElements(this._ast);
    this._dependencies = getModuleDependencies(this._ast, filepath);
    if (!this.isJSX) {
      this.definitions = Stream.empty;
    } else {
      this.definitions = this._rootComponents.pipe(mapJSXElementsToDeclarator);
    }
  }
}

export class JSXElementDeclaration {
  constructor(
    readonly name: string,
    readonly isExported: boolean,
    readonly declaratorAst: JSXElementFunction,
    readonly rootJSXElement: NodePath<t.JSXElement>,
  ) {}

  private get docRange() {
    return [this.declaratorAst.node.start, this.declaratorAst.node.end];
  }
  get id() {
    return `${this.name}:${Hash.array(this.docRange)}`;
  }
}

const getRootJSXElements = (ast: BabelParseResult) =>
  Stream.async<NodePath<t.JSXElement>>((emit) => {
    traverse(
      ast,
      {
        Program: {
          exit() {
            emit.chunk(Chunk.fromIterable(this.elements)).then(() => emit.end());
          },
        },
        JSXElement(path) {
          this.elements.push(path);
          path.skip();
        },
      },
      undefined,
      {
        elements: [] as NodePath<t.JSXElement>[],
      },
    );
  });

const mapJSXElementsToDeclarator = (stream: Stream.Stream<NodePath<t.JSXElement>>) =>
  Stream.filterMap(stream, (babelPath) => {
    const def = funcJSXElementFunction(babelPath);
    if (!def) return Option.none();
    const declarator = resolveDeclarator(def);
    return Option.some(
      new JSXElementDeclaration(declarator.name, declarator.isExported, def, babelPath),
    );
  });

const getModuleDependencies = (ast: BabelParseResult, filename: TwinPath.FilePath) => {
  const dependencies: ModuleDependency[] = [];
  for (const statement of ast.program.body) {
    if (!t.isImportDeclaration(statement)) continue;
    const importPath = statement.source.value;
    const isLocal = isLocalImport(importPath);
    const fullPath = TwinPath.absolutePathFromString(
      isLocal
        ? importPath
        : TwinPath.NodePath.resolve(TwinPath.NodePath.dirname(filename), importPath),
    );
    for (const specifier of statement.specifiers) {
      if (!t.isImportSpecifier(specifier)) continue;
      if (!t.isIdentifier(specifier.imported)) continue;

      dependencies.push(
        ModuleDependency.make({
          exportName: specifier.imported.name,
          filepath: fullPath,
          isLocal,
          localName: specifier.local.name,
          originalSource: importPath,
        }),
      );
    }
  }

  return dependencies;
};
