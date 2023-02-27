import { ComponentType, forwardRef, useMemo } from 'react';
import type { IStyleType } from '../types/styles.types';
import { mergeTWClasses } from '../utils/mergeClasses';

const styled = (Component: ComponentType) => {
  const Styled = forwardRef<unknown, any>(function StyledTW({ tw, className, ...props }, ref) {
    const transformClassValue: string[] = useMemo(() => [], []);

    const style: IStyleType = useMemo(() => {
      const mergedClassName = mergeTWClasses(
        [transformClassValue.join(' '), className ?? tw].join(' '),
      );

      if (mergedClassName && props.style) {
        return [
          { $$css: true, [mergedClassName]: mergedClassName },
          props.style,
        ] as IStyleType;
      } else if (mergedClassName) {
        return { $$css: true, [mergedClassName]: mergedClassName } as IStyleType;
      } else if (style) {
        return style as IStyleType;
      }
      return {};
    }, [props.style, className, tw, transformClassValue]);

    return <Component {...props} ref={ref} style={style} />;
  });

  if (typeof Component !== 'string') {
    Styled.displayName = `Tailwind.${Component.displayName || Component.name || 'NoName'}`;
  }
  return Styled;
};

export { styled };
