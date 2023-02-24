import { ComponentType, forwardRef, useMemo } from 'react';
import type { IStyleType } from '../types/styles.types';
import { mergeTWClasses } from '../utils/mergeClasses';

const styled = (Component: ComponentType) => {
  const classProps: string[] = [];
  const extraTransform: Record<string, string> = {};
  const createAnimatedComponent = () => {
    const Styled = forwardRef<unknown, any>(function StyledTW(
      { tw, className, ...props },
      ref,
    ) {
      let processedProps = props;
      const transformClassValue: string[] = useMemo(() => [], []);

      if (classProps.length > 0) {
        processedProps = {};

        for (const [key, value] of Object.entries(props)) {
          if (extraTransform[key] && typeof value === 'string') {
            const newKey = key === extraTransform[key] ? key : extraTransform[key];

            processedProps[newKey] = { $$css: true, [value]: value };
          } else if (classProps.includes(key) && typeof value === 'string') {
            transformClassValue.push(value);
          } else {
            processedProps[key] = value;
          }
        }
      }

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

      return <Component ref={ref} style={style} {...processedProps} />;
    });

    if (typeof Component !== 'string') {
      Styled.displayName = `Tailwind.${Component.displayName || Component.name || 'NoName'}`;
    }
    return Styled;
  };
  return createAnimatedComponent;
};

export { styled };
