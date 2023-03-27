import { ComponentType, forwardRef } from 'react';
import { useStyledComponent } from '../hooks/useStyledComponent.web';
import type { StyledOptions } from '../types/styled.types';

const styled = (
  Component: ComponentType,
  baseClassName?: string,
  styleOptions?: StyledOptions<any, any>,
) => {
  const Styled = forwardRef<unknown, any>(function StyledTW({ tw, className, ...props }, ref) {
    const style = useStyledComponent(
      {
        className: className ?? tw,
        inlineStyles: props.style,
        isFirstChild: false,
        isLastChild: false,
        nthChild: 0,
        parentID: '',
        classProps: {},
      },
      baseClassName!,
      // @ts-expect-error
      styleOptions,
    );

    return <Component {...props} ref={ref} style={style} />;
  });

  if (typeof Component !== 'string') {
    Styled.displayName = `Tailwind.${Component.displayName || Component.name || 'NoName'}`;
  }
  return Styled;
};

export { styled };
