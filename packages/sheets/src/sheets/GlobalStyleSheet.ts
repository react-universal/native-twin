import {
  InteractionPseudoSelectors,
  AppearancePseudoSelectors,
  PlatformPseudoSelectors,
  ChildPseudoSelectors,
} from '../constants';
import { css } from '../css';
import type { IStyleTuple, IStyleType, IInteractionPayload } from '../types';
import { cssPropertiesResolver } from '../utils';

class GlobalStyleSheet {
  private stylesCollection: Map<string, IStyleType> = new Map();

  private _getJSS(classNames: string[]) {
    const styleTuple = classNames.reduce((previous, current) => {
      const cache = this.stylesCollection.get(current);
      if (cache) {
        previous.push([current, cache]);
      } else {
        const styles = css(current);
        const rnStyles = cssPropertiesResolver(styles.JSS);
        previous.push([current, rnStyles]);
        this.stylesCollection.set(current, rnStyles);
      }
      return previous;
    }, [] as IStyleTuple[]);

    return styleTuple;
  }

  private _splitClasses(classNames = '') {
    const rawClassNames = classNames
      ?.replace(/\s+/g, ' ')
      .trim()
      .split(' ')
      .filter(
        (className) =>
          className !== '' && className !== 'undefined' && typeof className !== 'undefined',
      );
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

  private _getClassesForSelectors<T>(classNames: string[][], selectors: readonly T[]) {
    const classes: [T, string][] = [];
    for (const current of classNames) {
      if (!current[0] || !current[1]) continue;
      const pseudoSelector = current[0];
      const className = current[1];
      if (selectors.includes(pseudoSelector as T)) {
        classes.push([pseudoSelector as T, className]);
      }
    }
    return classes;
  }

  private _getStylesForPseudoClasses<T>(
    classNames: string[][],
    pseudoSelectors: readonly T[],
  ) {
    let pseudoSelectorStyles: [T, IInteractionPayload][] = [];
    const pseudoSelectorClasses = this._getClassesForSelectors(classNames, pseudoSelectors);
    const tupleUnion = pseudoSelectorClasses.reduce((prev, current) => {
      const [selectorType, selectorClassNames] = current;
      const index = prev.findIndex((d) => d[0] === selectorType);
      if (index !== -1 && index in prev) {
        prev[index] = [selectorType, `${prev[index]?.[1]} ${selectorClassNames}`];
      } else {
        prev.push([selectorType, selectorClassNames]);
      }
      return prev;
    }, [] as [T, string][]);
    for (const node of tupleUnion) {
      const selectorType = node[0];
      const selectorClassNames = node[1];
      const compiled = this._getJSS([selectorClassNames]);
      pseudoSelectorStyles.push([
        selectorType,
        {
          classNames: selectorClassNames,
          styles: compiled.reduce((obj, d) => Object.assign(obj, d[1]), {}),
        },
      ]);
    }
    return pseudoSelectorStyles;
  }

  registerClassNames(classNames: string) {
    const parsed = this._parseClassNames(classNames);
    const normalStyles = this._getJSS(parsed.normalClassNames);
    const interactionStyles = this._getStylesForPseudoClasses(
      parsed.interactionClassNames,
      InteractionPseudoSelectors,
    );
    const appearanceStyles = this._getStylesForPseudoClasses(
      parsed.interactionClassNames,
      AppearancePseudoSelectors,
    );
    const platformStyles = this._getStylesForPseudoClasses(
      parsed.interactionClassNames,
      PlatformPseudoSelectors,
    );
    const childStyles = this._getStylesForPseudoClasses(
      parsed.interactionClassNames,
      ChildPseudoSelectors,
    );
    const isParent = normalStyles.some(([name]) => name === 'group');
    return {
      isParent,
      interactionStyles,
      normalStyles,
      parsed,
      childStyles,
      appearanceStyles,
      platformStyles,
    };
  }
}

const globalStyleSheet = new GlobalStyleSheet();

export default globalStyleSheet;
