import { type ComponentType, createElement } from 'react';

export const renderComponent = (
  baseComponent: ComponentType<any>,
  props: Record<string, any> | null,
) => {
  const component = baseComponent;
  console.log('PROPS: ', props);
  return createElement(component, props);
};
