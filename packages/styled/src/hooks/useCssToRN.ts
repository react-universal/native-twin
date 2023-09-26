import { useId, useMemo } from 'react';
import { tw } from '@universal-labs/native-tailwind';
import { useStyledContext } from './useStyledContext';

export function useCssToRN(className: string) {
  const componentID = useId();
  const { context } = useStyledContext();
  const stylesheet = useMemo(() => {
    return tw(className, context);
  }, [className, context]);

  return { stylesheet, componentID };
}
