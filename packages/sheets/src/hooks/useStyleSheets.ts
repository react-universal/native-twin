import type { IUseStyleSheetsInput } from '../store/global.store';
import { useComponentRegistration } from './useComponentRegistration';

function useComponentStyleSheets({
  className,
  classPropsTuple,
  parentID,
}: IUseStyleSheetsInput) {
  const { component$, componentID } = useComponentRegistration({
    classPropsTuple,
    className,
    parentID,
  });
  return {
    component$,
    componentID,
  };
}

export { useComponentStyleSheets };
