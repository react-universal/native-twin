import type { SelectorGroup } from '../css';
import * as Decl from '../react-native/declarations/style.declaration';
import type { SheetEntry } from '../sheets';
import { getRuleSelectorGroups } from '../tailwind/tailwind.utils';
import * as Predicates from './sheet.predicates';

export class SheetEntryParser {
  readonly selectorGroups: SelectorGroup[];
  readonly declarations: Decl.AnyDeclaration[];
  readonly selector: {
    isChild: boolean;
    isGroupParent: boolean;
    isPointer: boolean;
  };

  constructor(private readonly entry: SheetEntry) {
    this.selectorGroups = getRuleSelectorGroups(this.entry.selectors);
    this.declarations = entry.declarations.map(Decl.fromSheetEntryDecl);
    this.selector = {
      isChild: this.selectorGroups.some(Predicates.isChildSelector),
      isPointer: this.selectorGroups.some(Predicates.isPointerSelector),
      isGroupParent: this.entry.selectors.includes('group'),
    };
  }

  get unknownDecls() {
    return this.declarations.filter((x) => x._tag === 'unknown');
  }

  get _rawEntry() {
    return this.entry;
  }

  get parsedDecls() {
    return this.declarations.map((dcl) => new DeclarationParser(dcl));
  }
}

export class DeclarationParser {
  constructor(private readonly declaration: Decl.AnyDeclaration) {}
  get _dcl() {
    return this.declaration;
  }

  get prop() {
    return this.declaration.prop;
  }

  get evaluated() {
    const parsed = Decl.parseDeclarationValue(this.declaration);
    if (parsed.isError) return null;
    return parsed.result;
  }
}
