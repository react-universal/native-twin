import { useEffect, useMemo } from 'react';
import { StyleSheet } from 'react-native';
import { useStore } from '@react-universal/core';

const useComponentRegistration = (id: string, className: string, styles?: any) => {
  const registerComponent = useStore((state) => state.components.registerComponent);
  const unRegisterComponent = useStore((state) => state.components.unregisterComponent);
  const finalStyles = useMemo(() => {
    const { styles: stylesValue } = registerComponent({
      id,
      className,
      styles,
    });
    return StyleSheet.flatten([stylesValue]);
  }, [registerComponent, id, className, styles]);

  useEffect(() => {
    return () => {
      unRegisterComponent(id);
    };
  }, [id, unRegisterComponent]);

  return {
    style: finalStyles,
  };
};

export { useComponentRegistration };
