import type { NodePath } from '@babel/traverse';
import type * as t from '@babel/types';
import { SheetEntryHandler } from '@native-twin/css/jsx';
import * as Tree from '@native-twin/helpers/tree';
import * as RA from 'effect/Array';
import * as Option from 'effect/Option';
import type {
  LoadedComponent,
  ModuleComponent,
  ResolvedModule,
} from '../Resolver/Models';
import type { CompilerStyleSheet } from '../models/CompilerSheet';
import type { JSXMappedAttribute } from '../models/JSXElement.model';
import { getJSXElementAttrs } from '../utils/babel/babel.utils';
import { extractStyledProp } from './Utils';

export class ComponentStyledProp {
  readonly entries: SheetEntryHandler[];
  readonly childEntries: SheetEntryHandler[];
  constructor(
    readonly prop: JSXMappedAttribute,
    entries: SheetEntryHandler[],
  ) {
    [this.entries, this.childEntries] = RA.partition(entries, (x) => x.isChildEntry());
  }
}

export class CompiledModule {
  get moduleID() {
    return this.module.id;
  }
  get modulePath() {
    return this.module.filename;
  }
  constructor(
    readonly module: ResolvedModule,
    readonly sheet: CompilerStyleSheet,
    readonly components: CompiledComponent[],
  ) {}

  get moduleSheet() {
    const twin = this.sheet;
    return RA.flatMap(this.components, (component) => {
      const sheetTree = Tree.mapTree<PlatformComponent, ComponentStyleSheet>(
        component.compiledTree,
        (node, parent) => {
          const compiledProps = node.value.getCompiledProps(twin);
          return new ComponentStyleSheet(node.value, compiledProps, parent?.value);
        },
      );
      return sheetTree.all().map((x) => x.value);
    });
  }
}

export class ComponentStyleSheet {
  constructor(
    private readonly component: PlatformComponent,
    readonly compiledProps: ComponentStyledProp[],
    private readonly parent?: ComponentStyleSheet,
  ) {}

  get parentID() {
    return this.parent?.component.componentID ?? null;
  }
}

export class PlatformComponent {
  get ast() {
    return this.component.babelPath;
  }
  get childs(): NodePath<t.JSXElement>[] {
    return this.ast.get('children').filter((x) => x.isJSXElement());
  }
  get childsSize() {
    return this.childs.length;
  }
  get index() {
    return this.parent?.childs.indexOf(this.ast);
  }
  get mappedProps() {
    return RA.getSomes(
      RA.map(this.attributes, (x) =>
        Option.fromNullable(extractStyledProp(x, this.component.ref.mapped)),
      ),
    );
  }
  get attributes() {
    return getJSXElementAttrs(this.ast.node);
  }

  get componentID() {
    return this.component.babelPath.scope.generateUid('Component');
  }

  get isImported() {
    return (
      this.component.ref.origin.kind === 'require' ||
      this.component.ref.origin.kind === 'import'
    );
  }

  get isLocallyDeclared() {
    return this.component.ref.origin.source === 'none';
  }

  get importSource() {
    return this.component.ref.origin.source;
  }

  constructor(
    private readonly component: LoadedComponent,
    readonly parent?: PlatformComponent,
  ) {}

  getCompiledProps(twin: CompilerStyleSheet) {
    return this.mappedProps.map((prop) => {
      const twinEntries = twin.twinFn(prop.value.text);
      return new ComponentStyledProp(
        prop,
        twinEntries.map((x) => new SheetEntryHandler(x, twin.ctx)),
      );
    });
  }
}

export class CompiledComponent {
  readonly _sheet = new Map<string, any>();

  get declaratorName() {
    return this.declarator.declarator.name;
  }

  get declaratorID() {
    return this.declarator.id;
  }
  get isExported() {
    return this.declarator.declarator.isExported;
  }

  get sheetSelector() {
    return `${this.declaratorName}:${this.declaratorID}`;
  }

  get rootComponent() {
    return this.compiledTree.root.value;
  }

  constructor(
    private readonly declarator: ModuleComponent,
    readonly compiledTree: Tree.Tree<PlatformComponent>,
  ) {}
}
