import type { ComponentType, ComponentProps } from 'react';
import { useChildren } from './hooks/useChildren';
import { useStyled } from './hooks/useStyled';
import type { IExtraProperties } from './styled.types';

function styled<T extends ComponentType>(Component: T) {
  const Styled = ({ className = '', style = {}, children, ...restProps }: any) => {
    const { styles, panHandlers, componentState } = useStyled(
      {
        inlineStyles: style,
        className,
      },
      restProps,
    );
    const childs = useChildren(children, componentState);
    return (
      <Component {...restProps} {...panHandlers} style={styles}>
        {childs}
      </Component>
    );
  };
  if (typeof Component !== 'string') {
    Styled.displayName = `StyledTW.${Component.displayName || 'NoName'}`;
  }
  return Styled as ComponentType<ComponentProps<typeof Component> & IExtraProperties>;
}

export { styled };
export { mergeTWClasses } from './utils/mergeClasses';
