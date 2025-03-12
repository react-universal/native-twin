import * as t from '@babel/types';
import { StyleSheetAdapter } from '@native-twin/core';
import type { SheetEntry, SheetEntryDeclaration } from '@native-twin/css';
import {
  type AnyDeclaration,
  type CompilerContext,
  type RuntimeSheetDeclaration,
  compileEntryDeclaration,
  fromSheetEntryDecl,
  mergeCompiledDeclarations,
  parseDeclarationValue,
} from '@native-twin/css/jsx';
import * as Data from 'effect/Data';
import type * as Option from 'effect/Option';
import type { JSXAttributePath } from '../Babel';
import type { InternalTwFn, InternalTwinConfig } from '../Config';
import type { TwinJSXElementNode } from '../Domain/TwinJSXElementNode';

export class TwinJSXInjectInfo extends Data.Class<{
  sheetID: string;
  hasExpressions: boolean;
  isExternal: boolean;
  node: TwinJSXElementNode;
  isNative: boolean;
}> {}

export class CompilerStyleSheet extends StyleSheetAdapter<InternalTwinConfig> {
  constructor(
    readonly ctx: CompilerContext,
    readonly twinFn: InternalTwFn,
    debug: boolean,
  ) {
    super(debug);
  }

  toRuntimeDecls(entries: SheetEntry[]): RuntimeSheetDeclaration[] {
    return entries
      .flatMap((x) => x.declarations)
      .map((x) => compileEntryDeclaration(x, this.ctx));
  }

  toNativeStyles(entries: SheetEntry[]) {
    const declarations = this.toRuntimeDecls(entries);
    return mergeCompiledDeclarations(declarations);
  }

  getStyledProps(node: TwinJSXElementNode) {
    return node.classNameProps.map((prop) => {
      const entries = this.twinFn(prop.text);
      return new TwinJSXNodeStyledProp({
        ast: prop.ast,
        entries: entries.map((x) => new CompilerSheetEntry(x)),
        expression: prop.expression,
        prop: prop.prop,
        target: prop.target,
        text: prop.text,
      });
    });
  }
}

export class TwinJSXNodeStyledProp extends Data.Class<{
  ast: JSXAttributePath;
  text: string;
  entries: CompilerSheetEntry[];
  expression: Option.Option<string>;
  target: string;
  prop: string;
}> {
  get jsxAttributeName() {
    return t.jsxIdentifier(this.target);
  }
}

export class CompilerSheetEntry {
  constructor(readonly entry: SheetEntry) {}

  get declarations() {
    return this.entry.declarations.map((decl) => new CompilerRuleDeclaration(decl));
  }

  get eval() {
    return this.declarations.map((x) => evalRuleDeclaration(x));
  }
}

export class CompilerRuleDeclaration {
  private readonly parsed: AnyDeclaration;
  private readonly _parsedValue: ReturnType<typeof parseDeclarationValue>;
  get kind() {
    return this.parsed._tag;
  }
  get hyphenized() {
    return this.parsed.hyphenized;
  }
  get declValue() {
    if (this._parsedValue.isError) {
      return {
        _tag: 'raw',
        value: this.parsed.value,
      } as const;
    }
    return this._parsedValue.result;
  }
  constructor(raw: SheetEntryDeclaration) {
    this.parsed = fromSheetEntryDecl(raw);
    this._parsedValue = parseDeclarationValue(this.parsed);
  }
}

export const evalRuleDeclaration = (decl: CompilerRuleDeclaration) => {
  const { declValue } = decl;
  if (declValue._tag === 'raw') {
    console.debug('UN_COMPILED: ', declValue.value);
    return;
  }
  if (declValue._tag === 'flex') {
    if (declValue.value._tag === 'StyleStringValue') {
      return declValue.value.value;
    }
    return declValue.value.value;
  }
  if (declValue._tag === 'dimension') {
    return [declValue.value, declValue.unit];
  }
  if (declValue._tag === 'unitless') {
    return declValue.value;
  }
  if (declValue._tag === 'color') {
    return declValue.value;
  }
  if (declValue._tag === 'literal') {
    return declValue.raw;
  }
  if (declValue._tag === 'transform') {
    console.log('TRANSFORM: ', declValue);
    return declValue.value;
  }
};
