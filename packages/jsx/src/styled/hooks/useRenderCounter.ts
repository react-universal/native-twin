import { useRef } from 'react';

export const useRenderCounter = () => ++useRef(0).current;
