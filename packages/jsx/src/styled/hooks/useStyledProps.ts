import { useEffect } from 'react';
import { tw } from '@native-twin/core';
import { atom, useAtomValue } from '@native-twin/helpers';
import { JSXStyledProps } from '../../jsx/jsx-custom-props';
import { ComponentSheet, createComponentSheet } from '../../sheet/StyleSheet';
import { colorScheme } from '../../store/observables/colorScheme.obs';
import { styledContext } from '../../store/observables/styles.obs';
import { twinConfigObservable } from '../../store/observables/twin.observer';

export const useStyledProps = (props: Record<string, any> | null) => {
  const colorTheme = useAtomValue(colorScheme);
  const styles = useAtomValue(
    atom((get) => {
      const finalProps: [string, ComponentSheet][] = [];
      const context = get(styledContext);
      if (props?.['styledProps']) {
        const styledProps = props?.['styledProps'] as JSXStyledProps[];
        for (const style of styledProps) {
          finalProps.push([style[0], createComponentSheet(style[1], context)]);
        }
      }
      return finalProps;
    }),
  );

  useEffect(() => {
    return tw.observeConfig((c) => {
      if (twinConfigObservable.get() !== c) {
        twinConfigObservable.set(c);
      }
    });
  }, []);
  return { styles, colorTheme };
};
