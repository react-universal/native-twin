import { useId, useMemo } from 'react';
import { virtualSheet } from '../styled/VirtualSheet';
import { useStyledContext } from './useStyledContext';

export function useCssToRN(className: string) {
  const componentID = useId();

  const { context } = useStyledContext();

  const stylesheet = useMemo(() => {
    return virtualSheet(className, context);
  }, [className, context]);

  return { stylesheet, componentID };
}
