import { ComponentProps, ComponentType, forwardRef } from 'react';
import { parseClassNames } from '@react-universal/core';

function styled<P extends unknown>(Component: ComponentType<P>) {
  const Styled = forwardRef<unknown, ComponentProps<typeof Component>>(
    //@ts-expect-error
    ({ className = '', ...restProps }, ref) => {
      const result = parseClassNames(className);
      console.log('STYLES: ', result);
      return <Component {...restProps} style={result.styles ?? {}} ref={ref} />;
    },
  );
  if (typeof Component !== 'string') {
    Styled.displayName = `StyledTW.${Component.displayName || Component.name || 'NoName'}`;
  }

  return Styled;
}

export { styled };
