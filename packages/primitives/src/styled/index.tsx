import type { ComponentType } from 'react';
import { parseClassNames } from '@react-universal/core';

const styled = (Component: ComponentType) => {
  const Styled = ({ className = '', ...restProps }) => {
    const result = parseClassNames(className);
    console.log('STYLES: ', result);
    return <Component {...restProps} style={result.styles ?? {}} />;
  };
  return Styled;
};

export { styled };
