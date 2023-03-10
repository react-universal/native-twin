import type { ComponentProps } from 'react';
import { Nav as ExpoNav } from '@expo/html-elements';
import { styled } from '@universal-labs/styled';

const Nav = styled(ExpoNav);

type NavProps = ComponentProps<typeof Nav>;

export type { NavProps };

export default Nav;
