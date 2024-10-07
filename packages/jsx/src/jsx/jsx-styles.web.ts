import { cx, tw } from '@native-twin/core';
import { JSXInternalProps } from '../types/jsx.types';
import { ComponentConfig } from '../types/styled.types';

export function jsxStyles(props: JSXInternalProps | null | undefined, type: any) {
  const configs = type?.defaultProps?.['configs'] as ComponentConfig[];
  if (props?.['className']) {
    const className = props['className'];
    let twinClassName = cx(`${className}`);
    if (typeof className === 'string' && twinClassName === '') {
      twinClassName = className;
    }
    const classes = tw(`${className}`);
    // if (!classes) return;
    // if (classes.length === 0) return;
    props['className'] = twinClassName;
    props['style'] = [
      {
        $$css: true,
        [twinClassName]: twinClassName,
      },
      props?.['style'] ?? '',
    ];
    if (props && configs) {
      for (const config of configs) {
        const source = props?.[config.source];
        // const sheet = props[`_${config.target}`];
        if (!source) continue;

        if (source) {
          tw(`${source}`);
          props[config.target] = cx`${source}`;
          // props[config.target] = finalSheet.getStyles({
          //   isParentActive: false,
          //   isPointerActive: false,
          // });
        }
      }
    }
  }
}
