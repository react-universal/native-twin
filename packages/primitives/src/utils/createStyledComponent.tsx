import type { ComponentType } from 'react';

const createStyledComponent = (Component: ComponentType) => {
  return <Component />;
};

export { createStyledComponent };
