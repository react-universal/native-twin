// import * as Equal from 'effect/Equal';
import { JSXInternalProps } from '../types/jsx.types';
import { ComponentConfig } from '../types/styled.types';
import { JSXStyleProp, JSXStyledProps } from './jsx-custom-props';

export function jsxStyles(props: JSXInternalProps | null | undefined, type: any) {
  const configs = type?.defaultProps?.['configs'] as ComponentConfig[];
  const styledProps: JSXStyleProp[] = [];
  if (props && configs) {
    for (const config of configs) {
      const source = props?.[config.source];
      if (!source) continue;

      if (source) {
        styledProps.push({
          className: source,
          prop: config.source,
          target: config.target,
        });
      }
    }
    if (styledProps.length === 0) {
      return;
    }
    const newProps = new JSXStyledProps(styledProps);
    // const oldProps = props?.['styledProps'] as JSXStyledProps;
    // if (oldProps && Equal.equals(oldProps, newProps)) {
    //   return;
    // }
    props['styledProps'] = newProps;
  }
}
