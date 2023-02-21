import { useMemo } from 'react';
import { useStore } from './useStore';

function useTailwind(classNames: string) {
  const data = useStore(classNames);
  return useMemo(() => data, [data]);
}

export { useTailwind };
