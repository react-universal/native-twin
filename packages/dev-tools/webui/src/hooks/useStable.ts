/* eslint-disable react-hooks/exhaustive-deps */
import { useMemo } from 'react';

export const useStable = <T extends Record<string, unknown>>(object: T) =>
  useMemo(() => object, Object.values(object));
