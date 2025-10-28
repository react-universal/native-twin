import { atom, useAtom, useAtomValue } from '@native-twin/helpers/react';
import { useCallback, useContext, useId, useMemo, useRef } from 'react';
import type {
  NativeSyntheticEvent,
  PressableProps,
  TextInputFocusEventData,
  Touchable,
} from 'react-native';
import { ContainersContext, GroupContext } from '../../context';
import { StyleSheet } from '../../sheet';
import type { ComponentState } from '../../store/components.store';
import type { ComponentConfig } from '../../types/styled.types';
import type { NativeTwinProps } from '../../utils/constants';

const DEFAULT_STATE: ComponentState['interactions'] = Object.freeze({
  isGroupActive: false,
  isLocalActive: false,
});

export const useStyledProps = (
  props: Pick<NativeTwinProps, '__twinID' | '__twinExpressions'>,
  _configs: ComponentConfig[],
) => {
  const reactID = useId();
  console.log('EXP: ', props.__twinExpressions);

  const twinID = props['__twinID'] ?? reactID;

  const container = useContext(ContainersContext);
  const handlers: Touchable & PressableProps = {};
  const context = useContext(GroupContext);
  const registry = useMemo(
    () => StyleSheet.getTwinStyle(twinID, props.__twinExpressions),
    [props, twinID],
  );

  const [state, setState] = useAtom(StyleSheet.getComponentState(twinID));
  const { parentState, compiledProps } = useAtomValue(
    atom((get) => {
      let parentState = DEFAULT_STATE;
      if (context && state.meta.hasGroupEvents) {
        parentState = get(StyleSheet.getComponentState(context))?.interactions;
      }

      const compiledProps = StyleSheet.getComponentStyledProps(
        twinID,
        state.interactions.isLocalActive,
        parentState.isGroupActive,
      );

      return {
        registry,
        parentState,
        compiledProps,
      };
    }),
  );

  if (container) {
    console.log('CONTAINER: ', container);
  }

  const interactionsRef = useRef<
    Touchable &
      PressableProps & {
        onBlur?: (e: NativeSyntheticEvent<TextInputFocusEventData>) => void;
        onFocus?: (e: NativeSyntheticEvent<TextInputFocusEventData>) => void;
      }
  >(props as any);

  const onChange = useCallback(
    (active: boolean) => {
      if (state.meta.hasPointerEvents || state.meta.isGroupParent) {
        setState({
          interactions: {
            isLocalActive: active,
            isGroupActive: state.meta.isGroupParent && active,
          },
          meta: state.meta,
        });
      }
    },
    [state.meta, setState],
  );

  if (state.meta.hasPointerEvents || state.meta.isGroupParent) {
    handlers.onTouchStart ??= (event) => {
      if (interactionsRef.current.onTouchStart) {
        interactionsRef.current.onTouchStart(event);
      }
      onChange(true);
    };
    handlers.onTouchEnd ??= (event) => {
      if (interactionsRef.current.onTouchEnd) {
        interactionsRef.current.onTouchEnd(event);
      }
      onChange(false);
    };
  }

  return { compiledProps, state, handlers, registry, parentState };
};
