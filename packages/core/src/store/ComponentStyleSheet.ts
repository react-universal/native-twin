import type { IComponentInteractions, IComponentAppearance } from '../types/store.types';
import type { IStyleType } from '../types/styles.types';
import globalStyleSheet from './GlobalStyleSheet';

export default class ComponentStyleSheet {
  className: string | undefined;
  classNameSet: Set<string>;
  baseStyles: IStyleType;
  interactionStyles: IComponentInteractions[];
  appearanceStyles: IComponentAppearance[];
  constructor(className: string | undefined) {
    this.className = className;
    this.classNameSet = new Set(this.classNamesArray);
    const styles = globalStyleSheet.registerClassNames(className ?? '');
    this.baseStyles = styles.normalStyles.reduce((obj, d) => Object.assign(obj, d[1]), {});
    this.interactionStyles = styles.interactionStyles;
    this.appearanceStyles = styles.appearanceStyles;
  }

  private get classNamesArray() {
    if (!this.className) return [];
    return this.className.replace(/\s+/g, ' ').trim().split(' ');
  }
}
