import { useId, useMemo } from 'react';
import { SheetManager } from '../sheet';
import { useStyledContext } from './useStyledContext';

export function useCssToRN(className: string) {
  const componentID = useId();

  const { context } = useStyledContext();

  const stylesheet = useMemo(() => {
    const manager = SheetManager(context);
    return manager(className);
  }, [className, context]);

  return { stylesheet, componentID };
}
