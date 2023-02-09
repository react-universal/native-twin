import { useEffect, useMemo } from 'react';
import { StyleSheet } from 'react-native';
import { useStore } from '@react-universal/core';

const useComponentRegistration = (id: string, className: string, styles?: any) => {
  const registerComponent = useStore((state) => state.components.registerComponent);
  const unRegisterComponent = useStore((state) => state.components.unregisterComponent);
  const component = useStore((state) => state.components.registeredComponents.get(id));
  const finalStyles = useMemo(() => {
    if (!component?.styles) return {};
    return StyleSheet.flatten([component.styles]);
  }, [component?.styles]);

  useEffect(() => {
    registerComponent({ id, className });
    return () => {
      unRegisterComponent(id);
    };
  }, [id, unRegisterComponent, registerComponent, className]);

  return {
    style: finalStyles,
  };
};

export { useComponentRegistration };
