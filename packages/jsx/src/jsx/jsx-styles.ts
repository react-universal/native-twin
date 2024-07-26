// import * as Equal from 'effect/Equal';
// import { styledContext } from '../store/observables';
import { JSXInternalProps } from '../types/jsx.types';

// import { ComponentConfig } from '../types/styled.types';
// import { JSXStyleProp, JSXStyledProps } from './jsx-custom-props';

export function jsxStyles(props: JSXInternalProps | null | undefined, type: any) {
  const componentID = props?.['_twinComponentID'];
  const twinSheet = props?.['_twinComponentSheet'];
  if (componentID && twinSheet) {
    // console.log('TWIN_SHEET', { componentID, twinSheet, props });
    // for (const sheet of twinSheet.sheets) {
    //   const currentSheet = props[sheet.prop] ?? {};
    //   props[sheet.prop] = Object.assign(
    //     currentSheet,
    //     sheet.getStyles({
    //       dark: styledContext.get().colorScheme === 'dark',
    //     }),
    //   );
    //   if (sheet.target && props[sheet.target]) {
    //     delete props[sheet.target];
    //   }
    // }
  }
  // const configs = type?.defaultProps?.['configs'] as ComponentConfig[];
  // const styledProps: JSXStyleProp[] = [];
  // if (props && configs) {
  //   for (const config of configs) {
  //     const source = props?.[config.source];
  //     if (!source) continue;

  //     if (source) {
  //       styledProps.push({
  //         className: source,
  //         prop: config.source,
  //         target: config.target,
  //       });
  //     }
  //   }
  //   if (styledProps.length === 0) {
  //     return;
  //   }
  //   const newProps = new JSXStyledProps(styledProps);
  //   // const oldProps = props?.['styledProps'] as JSXStyledProps;
  //   // if (oldProps && Equal.equals(oldProps, newProps)) {
  //   //   return;
  //   // }
  //   props['styledProps'] = newProps;
  // }
}
