import { Component, createRef, ReactNode } from 'react';
import { ComponentType, ComponentProps, forwardRef } from 'react';
import { findNodeHandle } from 'react-native';
import type { IExtraProperties } from './styled.types';

function styled<T extends ComponentType>(ComponentTarget: T) {
  const componentRef = createRef();
  const StyledClass = class StyledComponent extends Component<
    ComponentProps<T> & IExtraProperties
  > {
    constructor(props: ComponentProps<T> & IExtraProperties) {
      super(props);
    }
    shouldComponentUpdate(
      nextProps: Readonly<{}>,
      nextState: Readonly<{}>,
      nextContext: any,
    ): boolean {
      console.log('UPDATER: ', { nextProps, nextContext, nextState });
      return true;
    }
    componentDidMount(): void {
      const node = findNodeHandle(this);
      console.log('IM: ', this);
      console.log('NODE: ', node);
    }
    render(): ReactNode {
      // @ts-expect-error
      return <ComponentTarget {...this.props} ref={componentRef} />;
    }
  };
  // @ts-expect-error
  const Styled = forwardRef((props, ref) => <StyledClass ref={ref} {...props} />);
  if (typeof Styled !== 'string') {
    Styled.displayName = `StyledTW.${ComponentTarget.displayName || 'NoName'}`;
  }
  return Styled;
}

export { styled };
export { mergeTWClasses } from './utils/mergeClasses';
