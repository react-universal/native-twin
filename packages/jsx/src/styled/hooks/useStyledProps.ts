import { atom, useAtom, useAtomValue } from '@native-twin/helpers/react';
import { type ComponentState, styledJSXStore } from '@native-twin/styled';
import { useCallback, useContext, useDebugValue, useId, useMemo, useRef } from 'react';
import type {
  NativeSyntheticEvent,
  PressableProps,
  TextInputFocusEventData,
  Touchable,
} from 'react-native';
import { ContainersContext, groupContext } from '../../context/styled.context';
import { styledContext } from '../../store/observables';
import type { JSXInternalProps } from '../../types/jsx.types';
import type { ComponentConfig } from '../../types/styled.types';

const DEFAULT_STATE: ComponentState['interactions'] = {
  isGroupActive: false,
  isLocalActive: false,
};

export const useStyledProps = (props: JSXInternalProps, _configs: ComponentConfig[]) => {
  const reactID = useId();
  const twinID = props['__twinID'] ?? reactID;
  const registry = useMemo(() => styledJSXStore.getComponent(twinID), [twinID]);
  useDebugValue(registry);
  const container = useContext(ContainersContext);
  const styledCtx = useAtomValue(styledContext);
  const handlers: Touchable & PressableProps = {};
  const [state, setState] = useAtom(registry.interactionState);
  const context = useContext(groupContext);
  const parentState = useAtomValue(
    atom((get) => {
      if (!context || !registry.interactionState.get().meta.hasGroupEvents) return DEFAULT_STATE;
      const parentStore = styledJSXStore.getComponent(context);
      return get(parentStore.interactionState).interactions;
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

  console.log('PARENT: ', parentState, twinID);

  const compiledProps = useMemo(() => {
    return registry.getStyledProps(state.interactions.isLocalActive, parentState.isGroupActive);
    // .map(({ prop, target, declarations }) => {
    //   const compileDecls = [...declarations.base];

    //   if (state.interactions.isLocalActive) compileDecls.push(...declarations.pointer);
    //   if (state.interactions.isGroupActive) compileDecls.push(...declarations.group);

    //   const styles = composeDeclarations(compileDecls, styledCtx);
    //   return {
    //     prop,
    //     target,
    //     styles,
    //   };
    // });
  }, [registry, state.interactions.isLocalActive, parentState.isGroupActive]);

  return { compiledProps, state, handlers, registry, styledCtx, parentState };
};
