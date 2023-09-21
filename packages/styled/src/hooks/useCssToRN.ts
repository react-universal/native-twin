import { useId, useMemo } from 'react';
import { tw } from '@universal-labs/native-tailwind';

export function useCssToRN(className: string) {
  const componentID = useId();

  const stylesheet = useMemo(() => {
    return tw(className);
  }, [className]);

  return { stylesheet, componentID };
}
