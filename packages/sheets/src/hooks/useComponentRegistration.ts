import { useMemo, useSyncExternalStore } from 'react';
import {
  styleSheetApiHelpers,
  registerComponentInStore,
  subscribeToComponent,
  getComponentByID,
} from '../store/styles.store';
import { createComponentID } from '../utils/createComponentID';

interface IComponentRegistration {
  classPropsTuple?: [string, string][];
  className?: string;
  parentID?: string;
}

function useComponentRegistration({
  classPropsTuple,
  className,
  parentID,
}: IComponentRegistration) {
  const componentID = useMemo(() => createComponentID() as string, []);

  const classNameSet = useMemo(() => {
    const baseClasses = styleSheetApiHelpers.splitClassNames(className);
    if (!classPropsTuple) return baseClasses;

    const fullSet = classPropsTuple.reduce((prev, current) => {
      const classes = styleSheetApiHelpers.splitClassNames(current[1]);
      return prev.concat(classes);
    }, baseClasses);
    return fullSet;
  }, [className, classPropsTuple]);

  const id = useMemo(
    () => registerComponentInStore(classNameSet, componentID, parentID),
    [componentID, classNameSet, parentID],
  );

  const component$ = useSyncExternalStore(
    subscribeToComponent,
    () => getComponentByID(id),
    () => getComponentByID(id),
  );

  return {
    classNameSet,
    component$,
    componentID,
  };
}

export { useComponentRegistration };
