import { setup } from '@universal-labs/core';
import tailwindPlugin from '@universal-labs/core/tailwind-plugin';
import type { Config } from 'tailwindcss';
import {
  GROUP_PARENT_MASK,
  HOVER_INTERACTION_MASK,
  INITIAL_MASK,
  INTERACTIONS_MASK,
} from '../constants';
import type {
  IStyleTuple,
  IStyleType,
  IComponentInteractions,
  TInteractionPseudoSelectors,
  TAppearancePseudoSelectors,
  IComponentAppearance,
} from '../types';
import { selectorIsInteraction, selectorIsAppearance, cssPropertiesResolver } from '../utils';

class GlobalStyleSheet {
  private stylesCollection: Map<string, IStyleType> = new Map();
  private style: ReturnType<typeof setup>;
  private config: Config = { content: ['__'], plugins: [tailwindPlugin.nativePlugin] };

  constructor() {
    this.style = setup(this.config);
  }

  setConfig(config: Config) {
    this.config = config;
    this.style = setup(this.config);
  }

  private _getJSS(classNames: string[]) {
    const styleTuple = classNames.reduce((previous, current) => {
      const cache = this.stylesCollection.get(current);
      if (cache) {
        previous.push([current, cache]);
      } else {
        const styles = this.style(current);
        const rnStyles = cssPropertiesResolver(styles.JSS);
        previous.push([current, rnStyles]);
        this.stylesCollection.set(current, rnStyles);
      }
      return previous;
    }, [] as IStyleTuple[]);

    return styleTuple;
  }

  private _splitClasses(classNames = '') {
    const rawClassNames = classNames?.replace(/\s+/g, ' ').trim().split(' ');
    return rawClassNames;
  }

  private _parseClassNames(classNames = '') {
    const rawClassNames = this._splitClasses(classNames);
    const normalClassNames = rawClassNames.filter((item) => !item.includes(':'));
    const interactionClassNames = rawClassNames
      .filter((item) => item.includes(':'))
      .map((item) => item.split(':'));
    return {
      interactionClassNames,
      normalClassNames,
    };
  }

  private _getStylesForInteractionClasses(classNames: string[][]) {
    let interactionStyles: IComponentInteractions[] = [];
    const interactionsClasses = this._getInteractionClasses(classNames);
    for (const node of interactionsClasses) {
      const interactionType = node[0];
      const interactionClassNames = node[1];
      const compiled = this._getJSS([interactionClassNames]);
      interactionStyles.push([
        interactionType,
        {
          classNames: interactionClassNames,
          styles: compiled.reduce((obj, d) => Object.assign(obj, d[1]), {}),
        },
      ]);
    }
    return interactionStyles;
  }

  private _getStylesForAppearanceClasses(classNames: string[][]) {
    let interactionStyles: IComponentAppearance[] = [];
    const appearanceClasses = this._getAppearanceClasses(classNames);
    for (const node of appearanceClasses) {
      const appearanceType = node[0];
      const appearanceClassNames = node[1];
      const compiled = this._getJSS([appearanceClassNames]);
      interactionStyles.push([
        appearanceType,
        {
          classNames: appearanceClassNames,
          styles: compiled.reduce((obj, d) => Object.assign(obj, d[1]), {}),
        },
      ]);
    }
    return interactionStyles;
  }

  private _getAppearanceClasses(classNames: string[][]) {
    const interactions: [TAppearancePseudoSelectors, string][] = [];
    for (const current of classNames) {
      if (!selectorIsAppearance(current[0])) continue;
      const pseudoSelector = current[0];
      const className = current[1];
      interactions.push([pseudoSelector, className]);
    }
    return interactions;
  }

  private _getInteractionClasses(classNames: string[][]) {
    const interactions: [TInteractionPseudoSelectors, string][] = [];
    for (const current of classNames) {
      if (!selectorIsInteraction(current[0])) continue;
      const pseudoSelector = current[0];
      const className = current[1];
      interactions.push([pseudoSelector, className]);
    }
    return interactions;
  }

  registerClassNames(classNames: string) {
    const parsed = this._parseClassNames(classNames);
    const normalStyles = this._getJSS(parsed.normalClassNames);
    const interactionStyles = this._getStylesForInteractionClasses(
      parsed.interactionClassNames,
    );
    const appearanceStyles = this._getStylesForAppearanceClasses(parsed.interactionClassNames);
    const isParent = normalStyles.some(([name]) => name === 'group');
    let componentMask = INITIAL_MASK;
    if (isParent) {
      componentMask |= GROUP_PARENT_MASK;
    }
    if (interactionStyles.length > 0) {
      componentMask |= INTERACTIONS_MASK;
    }
    if (interactionStyles.some(([name]) => name === 'hover')) {
      componentMask |= HOVER_INTERACTION_MASK;
    }
    return {
      componentMask,
      interactionStyles,
      normalStyles,
      parsed,
      appearanceStyles,
    };
  }
}

const globalStyleSheet = new GlobalStyleSheet();

export function setTailwindConfig(config: Config) {
  globalStyleSheet.setConfig(config);
}

export default globalStyleSheet;
