import { useMemo } from 'react';
import { getStyledProps } from '../store/styles.handlers';

function useClassNamesToCss(className: string, classPropsTuple: [string, string][]) {
  const componentStyles = useMemo(
    () => getStyledProps(classPropsTuple, className),
    [className, classPropsTuple],
  );

  return componentStyles;
}

export { useClassNamesToCss };
