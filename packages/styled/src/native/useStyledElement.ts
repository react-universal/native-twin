import { hasOwnProperty } from '@native-twin/helpers';
import { type ComponentType, createElement, useId, useMemo, useState } from 'react';
import type { Props, ReactComponent, StyledConfiguration } from '../models/Styled.models';
import { type Config, mappingToConfig } from './native.utils';
import { StyleSheet } from './StyleSheet';

export const useStyledElement = <
  const C extends ReactComponent<any>,
  const M extends StyledConfiguration<C>,
>(
  component: C,
  incomingProps: Props,
  mapping: M,
) => {
  const [config] = useState(() => mappingToConfig(mapping));
  return useStyledComponent(component, incomingProps, config);
};

const useStyledComponent = (
  type: ComponentType<any>,
  originalProps: Record<string, any> | undefined | null,
  _configs: Config[] = [{ source: 'className', target: 'style' }],
) => {
  const reactID = useId();
  const twinID = originalProps?.['__twinID'] ?? reactID;

  const compiledProps = useMemo(
    () =>
      StyleSheet.getComponentStyledProps(twinID, {
        withGroup: false,
        withPointer: false,
        getProp: (key: string) => getComponentProp(key, originalProps ?? {}),
      }),
    [twinID, originalProps],
  );

  const props = originalProps ? { ...originalProps } : {};
  for (const propKey in compiledProps) {
    const oldProps = props[propKey] ? { ...props[propKey] } : {};
    props[propKey] = Object.assign(compiledProps[propKey] ?? {}, oldProps);
  }

  return createElement(type, props);
};

const getComponentProp = (key: string, props: Record<string, any>) => {
  if (!hasOwnProperty.call(props, key)) return null;
  const value = props[key];
  return typeof value === 'string' ? value : null;
};
