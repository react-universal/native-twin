import {
  type __Theme__,
  StyleSheetAdapter,
  sheetEntryToStyle,
  type TwinRuntimeContext,
} from '@native-twin/core';
import {
  type CompleteStyle,
  getRuleSelectorGroup,
  getRuleSelectorGroups,
  type SheetEntry,
} from '@native-twin/css';
import { compileEntryDeclaration, type RuntimeSheetDeclaration } from '@native-twin/css/jsx';
import { asArray, type MaybeArray } from '@native-twin/helpers';
import { StyleSheet as NativeSheet, Platform } from 'react-native';
import { INTERNAL_RESET, styledContext } from './native.store';
import { tw } from './native-tw';

class TwinStyleSheet extends StyleSheetAdapter<__Theme__> {
  create = NativeSheet.create;
  compose = NativeSheet.compose;
  flatten = NativeSheet.flatten;
  absoluteFill = NativeSheet.absoluteFill;
  absoluteFillObject = NativeSheet.absoluteFillObject;
  hairlineWidth = NativeSheet.hairlineWidth;

  get twinFn() {
    return tw;
  }
  get runtimeContext(): TwinRuntimeContext {
    return styledContext.get();
  }

  [INTERNAL_RESET]() {}

  toRuntimeDecls(entries: SheetEntry[]): RuntimeSheetDeclaration[] {
    const config = this.twinFn.config;
    return entries
      .flatMap((entry) => entry.declarations)
      .map((decl) =>
        compileEntryDeclaration(decl, {
          baseRem: config.root.rem,
          platform: Platform.OS,
        }),
      );
  }
  toNativeStyles(entries: SheetEntry[]): MaybeArray<CompleteStyle> {
    return entries
      .map((x) =>
        sheetEntryToStyle(
          {
            className: x.className,
            groups: getRuleSelectorGroups(x.selectors),
            declarations: this.toRuntimeDecls(asArray(x)),
            group: getRuleSelectorGroup(x.selectors),
            important: x.important,
            inherited: false,
            precedence: x.precedence,
          },
          styledContext.get(),
        ),
      )
      .filter((x) => x !== null);
  }
}

export const StyleSheet = new TwinStyleSheet(__DEV__);
