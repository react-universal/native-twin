import { tw } from '@native-twin/core';
import { createComponentSheet, StyleSheet } from '../sheet/StyleSheet';
import { JSXInternalProps } from '../types/jsx.types';
import { ComponentConfig } from '../types/styled.types';
import { JSXStyledProps } from './jsx-custom-props';

export function jsxStyles(props: JSXInternalProps | null | undefined, type: any) {
  const configs = type?.defaultProps?.['configs'] as ComponentConfig[];
  const styledProps: JSXStyledProps[] = [];
  if (props && configs) {
    for (const config of configs) {
      const source = props?.[config.source];
      // const sheet = props[`_${config.target}`];
      if (!source) continue;

      if (source) {
        const finalSheet = createComponentSheet(tw(`${source}`), StyleSheet.runtimeContext);
        styledProps.push([config.target, finalSheet]);
        // props[config.target] = finalSheet.getStyles({
        //   isParentActive: false,
        //   isPointerActive: false,
        // });
      }
    }
    props['styledProps'] = styledProps;
  }
}
