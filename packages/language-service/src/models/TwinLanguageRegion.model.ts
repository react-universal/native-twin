import type { SheetEntry } from '@native-twin/css';
import { asArray } from '@native-twin/helpers';
import * as vscode from 'vscode-languageserver-types';
import type { JsxAttributeValueRegion, JsxNodeRegion } from '../internal/LSPAdapterSpec';
import { runTwinParser } from '../internal/parsers/TwinParser.runner';
import type { ParsedRuleWithLocation, TwinParserOutput } from './TwinParser.models';

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

const fullParsed = runTwinParser;
// const flattenTwinCompositions = (
//   parsed: TwinParserOutput,
//   grouped = parsed.result,
//   results: ParsedRuleWithLocation[] = [],
// ): ParsedRuleWithLocation[] => {
//   const current = grouped.pop();

//   if (!current) return results;

//   if (current.type === 'ComposedClass') {
//     results.push(current);
//     return flattenTwinCompositions(parsed, grouped, results);
//   }
//   const baseNode = current.token.base;
//   let leadingText = '';
//   if (baseNode.token.type === 'CLASS_NAME') {
//     leadingText += baseNode.text;
//     if (!baseNode.text.endsWith('-')) {
//       leadingText += '-';
//     }
//   }
//   for (const child of current.token.composes) {
//     if (child.type === 'ComposedClass') {
//       results.push({ ...child, classNameText: leadingText.concat(child.classNameText) });
//       continue;
//     }
//     const newChilds = flattenTwinCompositions(parsed, [child]);
//     results.push(...newChilds);
//   }

//   return flattenTwinCompositions(parsed, grouped, results);
// };

export class TwinLanguageRegion {
  private _parsed: TwinParserOutput | null = null;
  constructor(
    readonly jsxRegion: JsxNodeRegion,
    readonly twinNode: JsxAttributeValueRegion,
    readonly location: vscode.Location,
    readonly entries: SheetEntry[],
  ) {
    // const flatten = flattenTwinCompositions(this.parsed);
    // console.log(flatten);
  }

  get parsed() {
    return (this._parsed ??= fullParsed({
      startOffset: this.twinNode.range.start.line,
      text: this.twinNode.text,
    }));
  }

  get parentStarts() {
    return this.location.range.start.character;
  }

  get compositions() {
    return this.parsed.result.map(
      (x) =>
        new TwinComposerHandler(
          x,
          this.getLocationOf(x),
          this.entries.filter((entry) => entry.className === x.parsed.n),
        ),
    );
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

  getLocationOf(node: ParsedRuleWithLocation) {
    const range = vscode.Range.create(
      vscode.Position.create(
        this.location.range.start.line,
        node.startOffset + this.parentStarts - 1,
      ),
      vscode.Position.create(this.location.range.end.line, node.endOffset + this.parentStarts - 1),
    );
    return vscode.Location.create(this.location.uri, range);
  }
}

export class TwinComposerHandler {
  get compositions(): ParsedRuleWithLocation[] {
    return [this.node];
  }
  get className() {
    return this.node.parsed.n;
  }
  get classNameTokens() {
    return asArray(this.node);
  }

  get range() {
    return this.location.range;
  }

  get declarations() {
    return this.sheetEntries.flatMap((x) => x.declarations);
  }

  constructor(
    readonly node: ParsedRuleWithLocation,
    readonly location: vscode.Location,
    readonly sheetEntries: SheetEntry[],
  ) {}

  get ids() {
    const selectors = this.sheetEntries.map((x) => ({
      selectors: x.selectors.sort().join(''),
      declarations: x.declarations
        .map((x) => x.prop)
        .sort()
        .join('')
        .concat(`${this.node.startOffset}`),
      className: x.className,
    }));
    return {
      ruleID: selectors.map((x) => x.selectors.concat(x.declarations)).join('_'),
      classNameID: selectors.map((x) => x.selectors.concat(x.className)).join('_'),
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
