import type { SelectorGroup } from '../css';
import type { RuntimeSheetDeclaration } from './SheetEntryDeclaration';

/**
 * @version 7.0.0
 */
export interface RuntimeJSXStyle {
  group: SelectorGroup;
  groups: SelectorGroup[];
  className: string;
  important: boolean;
  inherited: boolean;
  precedence: number;
  declarations: RuntimeSheetDeclaration[];
}
/**
 * @version 7.0.0
 */
export interface RuntimeTwinMappedProp {
  target: string;
  prop: string;
  templateEntries: string | null;
  classNames: string;
  entries: {
    base: RuntimeJSXStyle[];
    pointer: RuntimeJSXStyle[];
    child: RuntimeJSXStyle[];
    group: RuntimeJSXStyle[];
  };
  metadata: {
    isGroupParent: boolean;
    hasGroupEvents: boolean;
    hasPointerEvents: boolean;
  };
}

// /**
//  * @version 7.0.0
//  * @deprecated please use @type {TwinRuntimeComponent}
//  */
// export interface TwinInjectedObject {
//   id: string;
//   index: number;
//   parentSize: number;
//   parentID: string;
//   metadata: {
//     isGroupParent: boolean;
//     hasGroupEvents: boolean;
//     hasPointerEvents: boolean;
//   };
//   props: RuntimeTwinMappedProp[];
//   childStyles: RuntimeJSXStyle[];
// }

export interface TwinRuntimeComponent {
  id: string;
  index: number;
  parentSize: number;
  parentID: string | null;
  childIds: string[];
  metadata: {
    isGroupParent: boolean;
    hasGroupEvents: boolean;
    hasPointerEvents: boolean;
  };
  props: RuntimeTwinMappedProp[];
  childStyles: RuntimeJSXStyle[];
}
