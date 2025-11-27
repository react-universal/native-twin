import { asArray } from '@native-twin/helpers';
import * as vscode from 'vscode-languageserver-types';
import type { JsxAttributeValueRegion, JsxNodeRegion } from '../internal/LSPAdapterSpec';
import type {
  ParsedRuleWithLocation,
  ResolvedTwinResult,
} from './TwinParser.models';

export class TwinJSXLanguageRegion {
  private _compiled: TwinLanguageRegion[] | null = null;
  constructor(
    readonly region: JsxNodeRegion,
    readonly parsed: ParsedRuleWithLocation,
  ) {}

  get twiNodes() {
    return this._compiled;
  }

  compiledValue() {
    // return new TwinJSXLanguageRegion();
  }
}

export class TwinLanguageRegion {
  constructor(
    readonly jsxRegion: JsxNodeRegion,
    readonly twinNode: JsxAttributeValueRegion,
    readonly location: vscode.Location,
    readonly parserOutput: ResolvedTwinResult[],
  ) {}

  get parentStarts() {
    return this.location.range.start.character;
  }

  get compositions() {
    return this.parserOutput.map((x) => new TwinComposerHandler(x, this.getLocationOf(x.parsedRegion)));
    // return (this._compositions ||= this.parsed.result.flatMap((item) => {
    //   if (item.type === 'ComposedClass') {
    //     const entries = this.entries.filter((x) => x.className === item.text);
    //     return asArray(new TwinComposerHandler(item, this.getLocationOf(item), entries));
    //   }
    //   const baseNode = item.token.base;
    //   let leadingText = '';
    //   if (baseNode.token.type === 'CLASS_NAME') {
    //     leadingText += baseNode.text;
    //     if (!baseNode.text.endsWith('-')) {
    //       leadingText += '-';
    //     }
    //   }
    //   return item.token.composes.map(
    //     (x) =>
    //       new TwinComposerHandler(
    //         x,
    //         this.getLocationOf(x),
    //         this.entries.filter((entry) => entry.className === leadingText.concat(x.text)),
    //         item.token.base,
    //       ),
    //   );
    // }));
  }

  getLocationOf(node: ParsedRuleWithLocation): vscode.Location {
    const range = vscode.Range.create(
      vscode.Position.create(
        this.location.range.start.line,
        node.startOffset,
      ),
      vscode.Position.create(this.location.range.end.line, node.endOffset - 1),
    );
    return vscode.Location.create(this.location.uri, range);
  }
}

export class TwinComposerHandler {
  get classNameTokens() {
    return asArray(this.parsedRule);
  }

  get range() {
    return this.location.range;
  }

  get declarations() {
    if (!this.parsedRule.entry) return [];
    return this.parsedRule.entry.declarations;
  }

  constructor(
    readonly parsedRule: ResolvedTwinResult,
    readonly location: vscode.Location,
  ) {}

  get ids() {
    const selectors = this.parsedRule.parsedRegion.parsed.v.sort().join('');
    const declarations = this.declarations
      .sort()
      .join('')
      .concat(`${this.parsedRule.parsedRegion.startOffset}`);
    const className = this.parsedRule.parsedRegion.parsed.n;
    return {
      ruleID: selectors.concat(declarations),
      classNameID: selectors.concat(className),
    };
  }

  // get classesID() {
  //   return this.sheetEntries
  //     .flatMap((x) => x.selectors.sort().join(':').concat(x.className))
  //     .join('');
  // }

  // private getClassnameCompositions(composition: TwinComposedClassName) {}
}

// const getUniqueClassName = (entry: SheetEntry) => entry.selectors.join(':').concat(entry.className);

// const getUniqueRuleDecl = (entry: SheetEntry) =>
//   entry.selectors.join(':').concat(entry.declarations.map((x) => x.prop).join('-'));

// const getClassCompositionText = (composition: TwinClassNameToken) => {
//   return parsedRuleToClassName({ ...composition.value, p: 0, v: [] });
// };

// const getVariantCompositionText = (composition: TwinClassVariantToken) => {
//   return parsedRuleSetToClassNames(
//     composition.value.map((x) => ({ i: x.i, n: x.n, m: null, p: 0, v: [] })),
//   );
// };

// const getClassNameVariantCompositionText = (composition: TwinClassNameVariantToken) => {
//   return parsedRuleToClassName({
//     v: composition.value[0].value.map((x) => x.n),
//     i: composition.value[1].value.i || composition.value[0].value.some((x) => x.i),
//     m: composition.value[1].value.m,
//     n: composition.value[1].value.n,
//     p: 0,
//   });
// };

// const getGroupCompositionText = (composition: AnyTwinComposedClass) => {
//   return composition.text;
// };

// const getCompositionText = (composition: AnyTwinComposedClass) => {
//   if (composition.type === 'ComposedClass') {
//     if (composition.token.type === 'CLASS_NAME') {
//       return getClassCompositionText(composition.token);
//     }
//     if (composition.token.type === 'VARIANT') {
//       return getVariantCompositionText(composition.token);
//     }
//     if (composition.token.type === 'VARIANT_CLASS') {
//       return getClassNameVariantCompositionText(composition.token);
//     }
//     if (composition.token.type === 'ARBITRARY') {
//       return composition.text;
//     }
//     if (composition.token.type === 'GROUP') {
//       return getGroupCompositionText(composition);
//     }
//   }
//   return composition.text;
// };
