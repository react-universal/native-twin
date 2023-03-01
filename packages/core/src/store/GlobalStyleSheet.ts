import { setup } from '@react-universal/native-tailwind';
import {
  GROUP_PARENT_MASK,
  HOVER_INTERACTION_MASK,
  INITIAL_MASK,
  INTERACTIONS_MASK,
} from '../constants';
import { cssPropertiesResolver } from '../modules/resolve';
import type { IComponentInteractions } from '../types/store.types';
import type { IStyleTuple, IStyleType } from '../types/styles.types';
import { parseClassNames, parsePseudoElements } from '../utils/components.utils';

class GlobalStyleSheet {
  // private resolvedUtilities: Set<string> = new Set();
  private stylesCollection: Map<string, IStyleType> = new Map();
  private tw: ReturnType<typeof setup>;

  constructor() {
    this.tw = setup({ content: ['__'] });
  }

  private _getJSS(classNames: string[]) {
    const styleTuple = classNames.reduce((previous, current) => {
      const cache = this.stylesCollection.get(current);
      if (cache) {
        previous.push([current, cache]);
      } else {
        const styles = this.tw(current);
        const rnStyles = cssPropertiesResolver(styles.JSS);
        previous.push([current, rnStyles]);
        this.stylesCollection.set(current, rnStyles);
      }
      return previous;
    }, [] as IStyleTuple[]);

    return styleTuple;
  }

  private getStylesForInteractionClasses(classNames: string[][]) {
    let interactionStyles: IComponentInteractions[] = [];
    const interactionsClasses = parsePseudoElements(classNames);
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

  registerClassNames(classNames: string) {
    const parsed = parseClassNames(classNames);
    const normalStyles = this._getJSS(parsed.normalClassNames);
    const interactionStyles = this.getStylesForInteractionClasses(
      parsed.interactionClassNames,
    );
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
    };
  }
}

const globalStyleSheet = new GlobalStyleSheet();

export default globalStyleSheet;
