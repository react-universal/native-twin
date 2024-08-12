import { forwardRef, createElement, useId, useRef } from 'react';
import {
  NativeSyntheticEvent,
  PressableProps,
  TextInputFocusEventData,
  Touchable,
} from 'react-native';
import { groupContext } from '../../context';
import { colorScheme } from '../../store/observables';
import type { ComponentTemplateEntryProp, JSXFunction } from '../../types/jsx.types';
import type {
  StylableComponentConfigOptions,
  ReactComponent,
} from '../../types/styled.types';
import { getNormalizeConfig } from '../../utils/config.utils';
// import { getComponentDisplayName } from '../../utils/react.utils';
import { useStyledProps } from '../hooks/useStyledProps';

export const stylizedComponents = new Map<object | string, Parameters<JSXFunction>[0]>();

const twinProps = [
  '_twinComponentID',
  '_twinComponentSheet',
  '_twinComponentTemplateEntries',
];

export const NativeTwinHOC = <
  const T extends ReactComponent<any>,
  const M extends StylableComponentConfigOptions<any>,
>(
  Component: Parameters<JSXFunction>[0],
  mapping: StylableComponentConfigOptions<T> & M,
) => {
  let component = Component;
  const configs = getNormalizeConfig(mapping);
  // const type = getComponentType(baseComponent);

  const TwinComponent = forwardRef(function TwinComponent(props: any, ref) {
    const id = useId();
    const interactionsRef = useRef<
      Touchable &
        PressableProps & {
          onBlur?: (e: NativeSyntheticEvent<TextInputFocusEventData>) => void;
          onFocus?: (e: NativeSyntheticEvent<TextInputFocusEventData>) => void;
        }
    >(props);
    const componentID = props?.['_twinComponentID'];
    const { state, componentStyles, parentState, templateEntriesObj, onChange } =
      useStyledProps(
        componentID ?? id,
        props?.['_twinComponentSheet'],
        props?.['_twinComponentTemplateEntries'] as ComponentTemplateEntryProp[],
        props?.['debug'] ?? false,
      );

    // props = Object.assign({ ref }, props);

    const handlers: Touchable & PressableProps = {};

    if (
      componentStyles.metadata.hasPointerEvents ||
      componentStyles.metadata.hasGroupEvents ||
      componentStyles.metadata.isGroupParent
    ) {
      handlers.onTouchStart = function (event) {
        if (interactionsRef.current.onTouchStart) {
          interactionsRef.current.onTouchStart(event);
        }
        onChange(true);
      };
      handlers.onTouchEnd = function (event) {
        if (interactionsRef.current.onTouchEnd) {
          interactionsRef.current.onTouchEnd(event);
        }
        onChange(false);
      };
    }

    let newProps = {
      ...props,
      ...handlers,
    };

    if (componentStyles.sheets.length > 0) {
      for (const style of componentStyles.sheets) {
        const oldProps = newProps[style.prop] ? { ...newProps[style.prop] } : {};
        newProps[style.prop] = Object.assign(
          style.getStyles(
            {
              isParentActive: parentState.isGroupActive,
              isPointerActive: state.isLocalActive,
              dark: colorScheme.get() === 'dark',
            },
            templateEntriesObj[style.prop] ?? [],
          ),
          oldProps,
        );
      }
    }

    for (const x of configs) {
      if (x.target !== x.source) {
        if (x.source in newProps) {
          Reflect.deleteProperty(newProps, x.source);
        }
      }
    }

    for (const x of twinProps) {
      if (x in newProps) {
        Reflect.deleteProperty(newProps, x);
      }
    }

    if (componentStyles.metadata.isGroupParent) {
      newProps = {
        value: componentID ?? id,
        children: createElement(Component, { ...newProps, ref }),
      };
      // @ts-expect-error
      component = groupContext.Provider;
    }
    if (Component !== component) {
      return createElement(component, newProps);
    }
    return createElement(component, { ...newProps, ref });
  });
  // if (__DEV__) {
  //   TwinComponent.displayName = `NativeTwin(${getComponentDisplayName(Component)})`;
  // }

  stylizedComponents.set(Component, TwinComponent);

  return TwinComponent;
};

export const createStylableComponent = NativeTwinHOC;
