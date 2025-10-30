import type React from 'react';
import type {
  NativeSyntheticEvent,
  PressableProps,
  TextInputFocusEventData,
  Touchable,
} from 'react-native';

export interface JSXInternalProps extends Record<string, any> {
  twEnabled?: boolean;
  __twinID: string;
  __parentID: string;
  // _twinComponentID?: string;
  // _twinComponentSheet: RuntimeComponentEntry[];
  // _twinComponentTemplateEntries: ComponentTemplateEntryProp[];
}

export type JSXFunction = (
  type: React.ComponentType,
  props: JSXInternalProps | undefined | null,
  key?: React.Key,
  isStaticChildren?: boolean,
  __source?: unknown,
  __self?: unknown,
) => React.ElementType;

// export interface ComponentTemplateEntryProp {
//   id: string;
//   prop: string;
//   target: string;
//   entries: RuntimeSheetEntry[];
// }

export type TwinComponentInteractionProps = Touchable &
  PressableProps & {
    onBlur?: (e: NativeSyntheticEvent<TextInputFocusEventData>) => void;
    onFocus?: (e: NativeSyntheticEvent<TextInputFocusEventData>) => void;
  };
