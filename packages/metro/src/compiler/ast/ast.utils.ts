import { mappedComponents } from '../../utils';

/**
 * @domain Shared Transform
 * @description Extract the {@link MappedComponent} from any {@link ValidJSXElementNode}
 * */
export const getJSXElementConfig = (tagName: string) => {
  const componentConfig = mappedComponents.find((x) => x.name === tagName);
  if (!componentConfig) return null;

  return componentConfig;
};
