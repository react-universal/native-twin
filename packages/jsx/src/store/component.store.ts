import { tw } from '@native-twin/core';
import { AnyStyle } from '@native-twin/css';
import { ChildStylesContextFn } from '../context/styled.context';
import { createComponentSheet, StyleSheet } from '../sheet/StyleSheet';
import { ComponentConfig, StyledComponentSheet } from '../types/styled.types';

type InternalProps = Record<string, any> | null;
type SubscriberFn = () => void;

export class StyledComponentHandler {
  runtimeProps: InternalProps;
  private subscribers = new Set<SubscriberFn>();

  localInteractionsState = {
    active: false,
    hover: false,
    focus: false,
  };

  groupInteractionsState = {
    active: false,
    hover: false,
    focus: false,
  };

  propsMeta = {
    isGroupParent: false,
    hasGroupEvents: false,
    hasPointerEvents: false,
  };

  propStates: StyledProp[];

  configStyles: Record<string, AnyStyle> = {};

  parentStylesFn?: ChildStylesContextFn;

  constructor(
    configs: ComponentConfig[],
    props: InternalProps,
    parentStylesFn?: ChildStylesContextFn,
  ) {
    this.runtimeProps = props;
    this.propStates = configs.map((x, i) => {
      const prop = new StyledProp(i, x, { ...props });
      prop.createSheet();
      return prop;
    });
    this.parentStylesFn = parentStylesFn;

    // Setup bindings
    this.subscribe = this.subscribe.bind(this);
    this.getChildStyles = this.getChildStyles.bind(this);

    this.processSheet();
  }

  private processSheet() {
    for (const prop of this.propStates) {
      const sheetHandler = prop.propStyles;
      if (sheetHandler) {
        this.propsMeta.hasGroupEvents ||= sheetHandler.metadata.hasGroupEvents;
        this.propsMeta.hasPointerEvents ||= sheetHandler.metadata.hasPointerEvents;
        this.propsMeta.isGroupParent ||= sheetHandler.metadata.isGroupParent;

        const finalStyle = sheetHandler.getStyles({
          isParentActive: false,
          isPointerActive:
            this.localInteractionsState.hover ||
            this.localInteractionsState.active ||
            this.localInteractionsState.focus,
        });

        const ord = this.runtimeProps?.['ord'];
        const lastOrd = this.runtimeProps?.['lastOrd'];
        const inheritedStyles = this.parentStylesFn?.(ord, lastOrd);

        // console.log('INHERITED', inheritedStyles);

        Object.assign(finalStyle, inheritedStyles?.[prop.target] ?? {});

        this.configStyles[prop.target] = finalStyle;
      }
      this.configStyles = Object.assign({}, this.configStyles);
    }
  }

  receiveProps(newProps: Record<string, any> | null) {
    let changed = false;

    if (newProps === this.runtimeProps) {
      // console.log('EQUAL_PROPS');
      return;
    }

    for (const prop of this.propStates) {
      const newClassName = newProps?.[prop.target];

      if (!newClassName || newClassName === prop.currentClassName) {
        continue;
      }

      if (this.propStates[prop.index]) {
        this.propStates[prop.index]!.currentClassName = newClassName;
        this.propStates[prop.index]?.createSheet();
        changed = true;
      }
    }

    if (changed) {
      // console.log('CHANGES');

      this.processSheet();
      this.runtimeProps = newProps;
    }
  }

  getChildStyles(ord?: number, lastOrd?: number) {
    const childProps: Record<string, any> = {};

    for (const prop of this.propStates) {
      const styles = prop.propStyles;
      if (styles) {
        childProps[prop.target] = styles.getChildStyles({
          isEven: !!ord && ord % 2 === 0,
          isFirstChild: ord === 0,
          isLastChild: !!ord && !!lastOrd && ord === lastOrd,
          isOdd: !!ord && ord % 2 !== 0,
        });
      }
    }

    return childProps;
  }

  public getStyledProps() {
    return this.configStyles;
  }

  public setInteractions(value: typeof this.localInteractionsState) {
    this.localInteractionsState = { ...value };
    this.processSheet();
    for (const cb of this.subscribers) {
      cb();
    }
  }

  subscribe(cb: () => void): () => void {
    const subscribers = this.subscribers;
    subscribers.add(cb);
    return () => {
      subscribers.delete(cb);
    };
  }
}

class StyledProp {
  target: string;
  source: string;
  currentClassName?: string;
  index: number;

  // @ts-expect--error--
  propStyles?: StyledComponentSheet;

  constructor(index: number, config: ComponentConfig, props: InternalProps) {
    this.index = index;
    this.target = config.target;
    this.source = config.source;
    this.currentClassName = props?.[config.source];
  }

  public createSheet() {
    // console.log('CLASS_NAMES: ', classNames);
    // console.log('CURRENT: ', this.currentClassName);
    if (typeof this.currentClassName === 'string') {
      const finalSheet = createComponentSheet(
        tw(`${this.currentClassName}`),
        StyleSheet.runtimeContext,
      );

      this.propStyles = finalSheet;
    }
  }

  public compareClassNames(props: InternalProps) {}
}
