import type { PropsFrom } from '@native-twin/helpers';
import { createElement } from 'react';
import { TwinStyleSheet } from '../store/TwinStyledSheet';
import type { ComponentConfig, ReactComponent } from '../types/styled.types';

export const useStyledComponent = <C extends ReactComponent<any>>(
  component: C,
  props: PropsFrom<C> & { __twinID?: string },
  _config: ComponentConfig[] = [{ source: 'className', target: 'style' }],
) => {
  const newProps = { ...props };
  const styles = TwinStyleSheet.getComponentStyledProps(props?.__twinID);

  return createElement(component, Object.assign(newProps, styles ?? {}));
};
