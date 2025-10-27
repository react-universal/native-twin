import {
  getRuleSelectorGroup,
  getRuleSelectorGroups,
  type SheetEntry,
  type TWParsedRule,
} from '@native-twin/css';
import {
  mergeCompiledDeclarations,
  Predicates,
  type RuntimeJSXStyle,
  type RuntimeSheetDeclaration,
} from '@native-twin/css/jsx';

export interface CompiledSheetEntryInput {
  raw: SheetEntry;
  parsed: TWParsedRule;
  decls: RuntimeSheetDeclaration[];
}

export class CompiledSheetEntry implements CompiledSheetEntryInput {
  decls: RuntimeSheetDeclaration[];
  parsed: TWParsedRule;
  raw: SheetEntry;
  constructor(input: CompiledSheetEntryInput) {
    this.raw = input.raw;
    this.parsed = input.parsed;
    this.decls = input.decls;
  }
  toRuntime(inherited: boolean): RuntimeJSXStyle {
    return {
      className: this.raw.className,
      important: this.raw.important,
      inherited,
      precedence: this.raw.precedence,
      group: this.mainSelectorGroup,
      groups: this.selectorGroups,
      declarations: this.decls,
    };
  }
  get selectorGroups() {
    return getRuleSelectorGroups(this.parsed.v);
  }
  get mainSelectorGroup() {
    return getRuleSelectorGroup(this.parsed.v);
  }
  get isChildEntry() {
    return this.parsed.v.some(Predicates.isChildSelector);
  }
  get isPointerEntry() {
    return this.parsed.v.some(Predicates.isPointerSelector);
  }
  get isGroupSelector() {
    return this.parsed.v.some(Predicates.isGroupSelector);
  }
  get isGroupParent() {
    return this.raw.className === 'group';
  }
  get isBaseEntry() {
    return this.mainSelectorGroup === 'base' || this.selectorGroups.length === 0;
  }

  get isDarkEntry() {
    return this.selectorGroups.some(Predicates.isDarkSelector);
  }

  get styles() {
    return mergeCompiledDeclarations(this.decls);
  }
}
