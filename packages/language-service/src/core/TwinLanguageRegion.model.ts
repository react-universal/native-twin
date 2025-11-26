import type { SheetEntry } from '@native-twin/css';
import { asArray } from '@native-twin/helpers';
import { Location } from 'vscode-languageserver-types';
import type { JsxAttributeValueRegion } from '../internal/LSPAdapterSpec';
import type { InternalTwFn } from '../internal/TwinTypes.internal';
import type {
  AnyTwinComposedClass,
  TwinComposedClassName,
  TwinParsedClasses,
} from '../models/TwinParser.models';
import type { TwinLSPDocument } from './TwinLSPDocument.model';

export class TwinLanguageRegionHandler {
  private _compositions: TwinComposerHandler[] | null = null;
  readonly entries: SheetEntry[] = [];

  constructor(
    readonly region: JsxAttributeValueRegion,
    private readonly document: TwinLSPDocument,
    private readonly parsed: TwinParsedClasses,
    private readonly tw: InternalTwFn,
  ) {}

  get compositions() {
    return (this._compositions ||= this.parsed.composedClasses.flatMap((item) => {
      const range = Location.create(
        this.document.uri,
        this.document.getRangeFor(
          item.startOffset + item.parentStarts - 1,
          item.endOffset + item.parentStarts - 1,
        ),
      );
      if (item.type === 'ComposedClass') {
        const entries = this.tw(item.text);

        return asArray(new TwinComposerHandler(item, range, entries));
      }
      const baseNode = item.token.base;
      let leadingText = '';
      if (baseNode.token.type === 'CLASS_NAME') {
        leadingText += baseNode.text;
        if (!baseNode.text.endsWith('-')) {
          leadingText += '-';
        }
      }
      return item.token.composes.map((x) => {
        const range = Location.create(
          this.document.uri,
          this.document.getRangeFor(
            x.startOffset + x.parentStarts - 1,
            x.endOffset + x.parentStarts - 1,
          ),
        );
        const className = leadingText.concat(x.text);
        return new TwinComposerHandler(x, range, this.tw(className), item.token.base);
      });
    }));
  }

  // findCompositionAt(position: LSPPosition): TwinComposerHandler | null {
  //   if (!this.document.isPositionInRange(position, this.range)) return null;
  //   if (this.node.type === 'ComposedClass') return this;
  //   return this.getCompositions().find((x) => x.findCompositionAt(position)) ?? null;
  // }
}

export class TwinComposerHandler {
  // private _storedChilds: TwinComposerHandler[] | null = null;
  get leadingText() {
    if (!this.baseGroup) return '';
    return this.baseGroup.text.concat(
      this.node.type === 'ComposedClass' &&
        (this.node.token.type === 'CLASS_NAME' || this.node.token.type === 'VARIANT_CLASS')
        ? '-'
        : '',
    );
  }
  get compositions(): AnyTwinComposedClass[] {
    if (this.node.type === 'ComposedClass') return [this.node];
    return this.node.token.composes;
  }
  get className() {
    return this.leadingText.concat(this.node.text);
  }
  get classNameTokens() {
    if (this.node.type === 'ComposedClass') {
      return asArray(this.node);
    }
    return [];
  }

  get range() {
    return this.location.range;
  }

  constructor(
    readonly node: AnyTwinComposedClass,
    readonly location: Location,
    readonly sheetEntries: SheetEntry[],
    private baseGroup?: TwinComposedClassName,
  ) {}

  get declarationsID() {
    return this.sheetEntries.map((x) => x.declarations.map((x) => x.prop).join('-')).join('_');
  }

  get classesID() {
    return this.sheetEntries.flatMap((x) => x.selectors.join(':').concat(x.className)).join('');
  }

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
