import { forwardRef } from 'react';
import type { StyledComponentType } from './styled.types';
import useStyled from './useStyled';

export const StyledComponent = forwardRef(useStyled) as StyledComponentType;
