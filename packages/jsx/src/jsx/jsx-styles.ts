import { StyleSheet } from '../sheet/StyleSheet';
import { JSXInternalProps } from '../types/jsx.types';
import { ComponentConfig } from '../types/styled.types';
import { JSXStyledProps } from './jsx-custom-props';

export function jsxStyles(props: JSXInternalProps | null | undefined, type: any) {
  const configs = type?.defaultProps?.['configs'] as ComponentConfig[];
  const styledProps: JSXStyledProps[] = [];
  if (props && configs) {
    // let debug = false;
    for (const config of configs) {
      // console.log('TYPE: ', { type, props }, false, null, false);
      const source = props?.[config.source];
      // const sheet = props[`_${config.target}`];
      if (!source) continue;

      if (source) {
        // debug = true;
        const finalSheet = StyleSheet.registerClassNames(source);
        styledProps.push([config.target, finalSheet]);
        // props[config.target] = finalSheet.getStyles({
        //   isParentActive: false,
        //   isPointerActive: false,
        // });
      }
    }
    props['styledProps'] = styledProps;
    // if (debug) {
    //   console.debug('CMP: ', type, props);
    // }
  }
}
