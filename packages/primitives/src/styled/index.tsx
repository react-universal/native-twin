import { ComponentProps, ComponentType, forwardRef } from 'react';

// import { parseClassNames } from '@react-universal/core';

function styled<P extends unknown>(Component: ComponentType<P>) {
  const Styled = forwardRef<unknown, ComponentProps<typeof Component>>(
    //@ts-expect-error
    ({ className = '', ...restProps }, ref) => {
      return <Component {...restProps} ref={ref} />;
    },
  );
  if (typeof Component !== 'string') {
    Styled.displayName = `StyledTW.${Component.displayName || Component.name || 'NoName'}`;
  }

  return Styled;
}

export { styled };
