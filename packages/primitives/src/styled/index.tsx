import { ComponentProps, ComponentType, forwardRef, useEffect, useId, useMemo } from 'react';
import { useStore } from '@react-universal/core';

// import { parseClassNames } from '@react-universal/core';

function styled<P extends unknown>(Component: ComponentType<P>) {
  const Styled = forwardRef<unknown, ComponentProps<typeof Component>>(
    //@ts-expect-error
    ({ className = '', style, ...restProps }, ref) => {
      const componentID = useId();
      const registerComponent = useStore((state) => state.components.registerComponent);
      const unRegisterComponent = useStore((state) => state.components.unregisterComponent);
      useEffect(() => {
        // registerComponent({ id: componentID, className, styles: {} });
        return () => {
          unRegisterComponent(componentID);
        };
      }, [componentID, registerComponent, className, unRegisterComponent]);
      const componentPayload = useMemo(() => {
        const register = registerComponent({ id: componentID, className, styles: {} });
        console.log('REGISTERED: ', register);
        return register;
      }, [registerComponent, componentID, className]);
      return (
        <Component
          key={componentID}
          style={[componentPayload?.styles, style]}
          {...restProps}
          ref={ref}
        />
      );
    },
  );
  if (typeof Component !== 'string') {
    Styled.displayName = `StyledTW.${Component.displayName || Component.name || 'NoName'}`;
  }

  return Styled;
}

export { styled };
