import { CssResolver } from '../css';
import { SheetInteractionState } from '../types/css.types';
import { CssParserData } from '../types/parser.types';
import { AnyStyle, FinalSheet } from '../types/rn.types';

interface CXProcessor {
  (classNames: string): { generated: string; target: string[] };
  hash(classNames: string): string;
}

interface GetChildStyles {
  isFirstChild: boolean;
  isLastChild: boolean;
  isEven: boolean;
  isOdd: boolean;
}
export class MainSheet {
  private processor: CXProcessor;
  private virtualSheet = new Map<string, FinalSheet>();
  constructor(processor: CXProcessor) {
    this.processor = processor;
  }

  getStyles(sheet: FinalSheet, input: SheetInteractionState) {
    const styles: AnyStyle = { ...sheet.base };
    if (input.isPointerActive) Object.assign(styles, { ...sheet.pointer });
    if (input.isParentActive) Object.assign(styles, { ...sheet.group });
    return styles;
  }

  getChildStyles(sheet: FinalSheet, input: GetChildStyles) {
    const result: AnyStyle = {};
    if (input.isFirstChild) {
      Object.assign(result, sheet.first);
    }
    if (input.isLastChild) {
      Object.assign(result, sheet.last);
    }
    if (input.isEven) {
      Object.assign(result, sheet.even);
    }
    if (input.isOdd) {
      Object.assign(result, sheet.odd);
    }
    return Object.freeze(result);
  }

  parse(className: string, context: CssParserData['context']) {
    const hash = this.processor.hash(className);
    if (this.virtualSheet.has(hash)) {
      const tx = this.processor(className);
      const finalSheet = this.virtualSheet.get(hash)!;
      return {
        finalSheet,
        getStyles: (input: SheetInteractionState) => this.getStyles(finalSheet, input),
        getChildStyles: (data: GetChildStyles) => this.getChildStyles(finalSheet, data),
        metadata: {
          isGroupParent: tx.generated.split(' ').includes('group'),
          hasPointerEvents: Object.keys(finalSheet.pointer).length > 0,
          hasGroupEvents: Object.keys(finalSheet.group).length > 0,
        },
      };
    }
    const tx = this.processor(className);
    const target = tx.target;
    const sheet = CssResolver(target, context);
    this.virtualSheet.set(hash, sheet);
    const finalSheet = this.virtualSheet.get(hash)!;
    return {
      finalSheet,
      getStyles: (input: SheetInteractionState) => this.getStyles(finalSheet, input),
      getChildStyles: (data: GetChildStyles) => this.getChildStyles(finalSheet, data),
      metadata: {
        isGroupParent: tx.generated.split(' ').includes('group'),
        hasPointerEvents: Object.keys(finalSheet.pointer).length > 0,
        hasGroupEvents: Object.keys(finalSheet.group).length > 0,
      },
    };
  }
}
