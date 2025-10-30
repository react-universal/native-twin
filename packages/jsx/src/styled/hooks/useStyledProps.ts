import { hasOwnProperty } from '@native-twin/helpers';
import { atom, useAtom, useAtomValue } from '@native-twin/helpers/react';
import { useCallback, useContext, useDebugValue, useId, useMemo, useRef } from 'react';
import type { PressableProps, Touchable } from 'react-native';
import { ContainersContext, GroupContext } from '../../context';
import { StyleSheet } from '../../sheet';
import type { TwinComponentInteractionProps } from '../../types/jsx.types';
import { DEFAULT_STATE, type NativeTwinProps } from '../../utils/constants';

export const useStyledProps = (
  props: Pick<NativeTwinProps, '__twinID' | '__twinExpressions'> & Record<string, any>,
) => {
  // const configs = getNormalizeConfig(
  //   props["mappings"] as NativeTwinProps["mappings"]
  // );
  const reactID = useId();
  const interactionsRef = useRef<TwinComponentInteractionProps>(props as any);
  // console.log('EXP: ', props.__twinExpressions);

  const twinID = props['__twinID'] ?? reactID;

  const container = useContext(ContainersContext);
  const handlers: Touchable & PressableProps = {};
  const context = useContext(GroupContext);
  const registry = StyleSheet.getTwinStyle(twinID);

  const [state, setState] = useAtom(StyleSheet.getComponentState(twinID));

  const parentState = useAtomValue(
    atom((get) => {
      let parentState = DEFAULT_STATE;
      if (context && state.meta.hasGroupEvents) {
        parentState = get(StyleSheet.getComponentState(context))?.interactions;
      }
      return parentState;
    }),
  );

  const compiledProps = useMemo(
    () =>
      StyleSheet.getComponentStyledProps(twinID, {
        withGroup: parentState.isGroupActive,
        withPointer: state.interactions.isLocalActive,
        getProp: (key: string) => getComponentProp(key, props),
      }),
    [parentState.isGroupActive, state.interactions.isLocalActive, twinID, props],
  );

  if (container) {
    console.log('CONTAINER: ', container);
  }

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

  useDebugValue(compiledProps);
  useDebugValue(parentState);

  return { compiledProps, state, handlers, registry, parentState };
};

const getComponentProp = (key: string, props: Record<string, any>) => {
  if (!hasOwnProperty.call(props, key)) return null;
  const value = props[key];
  return typeof value === 'string' ? value : null;
};
