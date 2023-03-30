import { Platform } from 'react-native';
import type {
  TValidAppearancePseudoSelectors,
  TValidChildPseudoSelectors,
  TValidInteractionPseudoSelectors,
  TValidPlatformPseudoSelectors,
} from '../constants';
import type { IStyleType, IInteractionPayload } from '../types';
import globalStyleSheet from './GlobalStyleSheet';

export default class ComponentStyleSheet {
  className: string | undefined;
  classNameSet: Set<string>;
  baseStyles: IStyleType;
  interactionStyles: [TValidInteractionPseudoSelectors, IInteractionPayload][];
  appearanceStyles: [TValidAppearancePseudoSelectors, IInteractionPayload][];
  platformStyles: [TValidPlatformPseudoSelectors, IInteractionPayload][];
  childStyles: [TValidChildPseudoSelectors, IInteractionPayload][];

  constructor(className: string | undefined) {
    this.className = className;
    this.classNameSet = new Set(this.classNamesArray);
    const styles = globalStyleSheet.registerClassNames(className ?? '');
    this.interactionStyles = styles.interactionStyles;
    this.appearanceStyles = styles.appearanceStyles;
    this.platformStyles = styles.platformStyles;
    this.childStyles = styles.childStyles;
    this.baseStyles = styles.normalStyles.reduce((prev, current) => {
      const platformStyles = this.getPlatformStyles;
      Object.assign(prev, current[1]);
      platformStyles.forEach((item) => {
        Object.assign(prev, item[1].styles);
      });
      return prev;
    }, {});
  }

  private get getPlatformStyles() {
    if (Platform.OS === 'web') {
      return this.platformStyles.filter((d) => d[0] === 'web');
    }
    return this.platformStyles.filter((d) => d[0] === Platform.OS || d[0] === 'native');
  }

  private get classNamesArray() {
    if (!this.className) return [];
    return this.className.replace(/\s+/g, ' ').trim().split(' ');
  }
}
