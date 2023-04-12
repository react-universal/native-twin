import { useMemo } from 'react';
import { getStyledProps } from '../store/styles.handlers';

function useClassNamesToCss(classPropsTuple: [string, string][]) {
  const componentStyles = useMemo(() => getStyledProps(classPropsTuple), [classPropsTuple]);

  return componentStyles;
}

export { useClassNamesToCss };
