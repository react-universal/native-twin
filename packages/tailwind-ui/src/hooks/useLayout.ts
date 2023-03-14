import { useState } from 'react';
import type { LayoutChangeEvent } from 'react-native';

export const useLayout = () => {
  const [layout, setLayout] = useState<
    LayoutChangeEvent['nativeEvent']['layout'] | undefined
  >();
  const onLayout = (e: any) => {
    setLayout(e.nativeEvent.layout);
  };

  return { onLayout, layout };
};
