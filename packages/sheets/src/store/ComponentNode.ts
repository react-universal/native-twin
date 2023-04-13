import { immerable } from 'immer';
import type { TValidInteractionPseudoSelectors } from '../constants';
import type { IComponentsStyleSheets, IRegisterComponentStore } from './global.store';
import { getStylesForClassProp } from './styles.handlers';

interface ComponentNodeInput {
  componentID: string;
  styledProps: { [key: string]: IComponentsStyleSheets };
  meta: {
    classNames: string;
    parentID?: string;
    groupID?: string;
    isFirstChild: boolean;
    isLastChild: boolean;
    nthChild: number;
  };
}
export default class ComponentNode {
  [immerable] = true;
  meta: IRegisterComponentStore['meta'];
  id: string;
  interactionsState: Record<TValidInteractionPseudoSelectors, boolean> = {
    'group-active': false,
    'group-focus': false,
    'group-hover': false,
    active: false,
    focus: false,
    hover: false,
  };
  styledProps?: {
    [key: string]: IComponentsStyleSheets;
  };
  classNames: string;
  constructor(input: ComponentNodeInput) {
    this.id = input.componentID;
    this.styledProps = input.styledProps;
    this.classNames = input.meta.classNames;
    // this.styleSheet = getStylesForClassProp(input.meta.classNames);
    let hasGroupInteractions = this.styleSheet.classNamesSet.some((item) =>
      item.startsWith('group-'),
    );
    let hasPointerInteractions = this.styleSheet.interactionStyles.length > 0;
    let isGroupParent = this.styleSheet.classNamesSet.includes('group');
    for (const currentPropStylesheet of Object.values(input.styledProps)) {
      hasGroupInteractions = currentPropStylesheet.classNamesSet.some((item) =>
        item.startsWith('group-'),
      );
      hasPointerInteractions = currentPropStylesheet.interactionStyles.length > 0;
      isGroupParent = currentPropStylesheet.classNamesSet.includes('group');
    }
    this.meta = {
      ...input.meta,
      hasGroupInteractions,
      hasPointerInteractions,
      isGroupParent,
    };
  }

  get styleSheet() {
    return getStylesForClassProp(this.classNames);
  }
}
