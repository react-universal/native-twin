import {
  type CompleteStyle,
  parsedRuleToClassName,
  parseTWTokens,
  type SheetEntry,
  type TWParsedRule,
} from '@native-twin/css';
import type { RuntimeSheetDeclaration, TwinRuntimeComponent } from '@native-twin/css/jsx';
import { asArray, type MaybeArray } from '@native-twin/helpers';
import type { StyleProp } from 'react-native';
import { parsedRuleToEntry } from '../convert/ruleToEntry';
import { CompiledSheetEntry } from '../twin/compiler.models';
import type { __Theme__, RuntimeTW } from '../types/theme.types';
import { cx } from './cx';
import type { TwinRuntimeContext } from './runtime.context';
import {
  type ComponentStyleRegistry,
  EMPTY_RN_STYLES,
  EMPTY_STYLE_REGISTRY,
  type TwinComponentGetterOptions,
} from './sheet/Models';
import { NativeTwinProcessor } from './sheet/TwinProcessor';
import { mergeCLassNameStyle, mergeComponentStyledProps } from './sheet/utils';

export abstract class StyleSheetAdapter<Theme extends __Theme__ = __Theme__> {
  protected _ruleRegistry = new Map<string, CompiledSheetEntry>();
  protected _processor: NativeTwinProcessor;
  protected _twinComponents = new Map<string, TwinRuntimeComponent>();

  abstract twinFn: RuntimeTW<Theme>;
  abstract runtimeContext: TwinRuntimeContext;
  abstract toRuntimeDecls(entries: SheetEntry[]): RuntimeSheetDeclaration[];
  abstract toNativeStyles(entries: SheetEntry[]): MaybeArray<CompleteStyle>;

  get target() {
    return this.twinFn.target;
  }

  get twinContext() {
    return this.twinFn.context;
  }

  constructor(readonly debug: boolean) {
    this._processor = new NativeTwinProcessor();
  }

  registerComponent(data: MaybeArray<TwinRuntimeComponent>) {
    for (const component of asArray(data)) {
      this._twinComponents.set(component.id, component);
      this._processor.runtimeComponentToRegistry(component, this.runtimeContext);
    }
  }

  registerComponentRuntime(
    id: string,
    options: TwinComponentGetterOptions,
  ): ComponentStyleRegistry {
    const registered = this.getTwinStyle(id);

    if (!registered) return EMPTY_STYLE_REGISTRY;

    let classNames = '';
    const props = registered.props.flatMap((x) => {
      const value = options.getProp?.(x.prop);
      if (!value) return [];
      const propClassName = cx`${value}`;
      if (!propClassName) return x;
      classNames = classNames.padStart(1, ' ');
      classNames += propClassName;
      const registry = this._processor.compiledSheetEntriesToClassNameStyles(
        parseTWTokens(value).map((x) => this.compileParsedRule(x)),
        this.runtimeContext,
      );
      return asArray({
        classname: propClassName,
        expression: null,
        prop: x.prop,
        styles: registry,
        target: x.target,
        text: propClassName,
      });
    });

    const newProps = registered.props.flatMap((x) => {
      const lookup = props.find((lc) => lc.prop === x.prop);
      if (!lookup) return [x];

      return asArray({
        ...x,
        styles: mergeCLassNameStyle(x.styles, lookup.styles),
      });
    });

    return { id, props: newProps, readClassProp: () => null };
  }

  compileParsedRule(rule: TWParsedRule): CompiledSheetEntry {
    const hash = parsedRuleToClassName(rule);
    if (this._ruleRegistry.has(hash)) {
      return this._ruleRegistry.get(hash)!;
    }
    const entry = parsedRuleToEntry(rule, this.twinFn.context);
    const decls = this.toRuntimeDecls(asArray(entry));
    return new CompiledSheetEntry({ decls, parsed: rule, raw: entry });
  }

  getComponentStyledProps(
    id: string,
    options: TwinComponentGetterOptions,
  ): { [key: string]: StyleProp<CompleteStyle> } {
    const styles = this._processor.getStyleRegistry(id);
    if (!styles) return EMPTY_RN_STYLES;

    // if (getProp) {
    //   for (const _ of styles.props) {
    //     const value = getProp(_.prop);
    //     if (!value) continue;
    //     const twinRule = parseTWTokens(value);
    //     if (twinRule.length > 0) {
    //       let newStyles = [...styles.props];
    //       for (const x of twinRule.map((x) => this.compileParsedRule(x))) {
    //         const styles = x.decls
    //           .map((d) => this._processor.runtimeDeclToNative(d, this.runtimeContext))
    //           .reduce(mergeStyles);
    //         newStyles = newStyles.map((style) => {
    //           if (style.prop === _.prop) {
    //             return {
    //               ...style,
    //               styles: {
    //                 ...style.styles,
    //                 base: x.isBaseEntry
    //                   ? mergeStyles(style.styles.base, styles)
    //                   : style.styles.base,
    //                 dark: x.isDarkEntry
    //                   ? mergeStyles(style.styles.dark, styles)
    //                   : style.styles.dark,
    //                 group: x.isGroupSelector
    //                   ? mergeStyles(style.styles.group, styles)
    //                   : style.styles.group,
    //                 pointer: x.isPointerEntry
    //                   ? mergeStyles(style.styles.pointer, styles)
    //                   : style.styles.pointer,
    //               },
    //             };
    //           }
    //           return style;
    //         });
    //       }
    //       return mergeComponentStyledProps(
    //         {
    //           ...styles,
    //           props: newStyles,
    //         },
    //         options.withPointer,
    //         options.withGroup,
    //       );
    //     }
    //   }
    // }

    return mergeComponentStyledProps(
      this.registerComponentRuntime(id, options),
      options.withPointer,
      options.withGroup,
    );
  }

  getTwinStyle(recordID: string, _options?: TwinComponentGetterOptions): ComponentStyleRegistry {
    const cmp = this._processor.getStyleRegistry(recordID);
    return cmp ?? EMPTY_STYLE_REGISTRY;
  }

  getComponent(id: string) {
    return this._twinComponents.get(id);
  }

  reset() {
    this._twinComponents.clear();
  }
}
