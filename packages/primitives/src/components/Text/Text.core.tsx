import {
  Code as NativeCode,
  H1 as NH1,
  H2 as NH2,
  H3 as NH3,
  H4 as NH4,
  H5 as NH5,
  H6 as NH6,
  Span as NSpan,
  Strong as NStrong,
  P as NP,
} from '@expo/html-elements';
import { styled } from '@universal-labs/styled';

NH1.displayName = 'H1';
NH2.displayName = 'H2';
NH3.displayName = 'H3';
NH4.displayName = 'H4';
NH5.displayName = 'H5';
NH6.displayName = 'H6';
NativeCode.displayName = 'Code';
NSpan.displayName = 'Span';
NStrong.displayName = 'Strong';

const Span = styled(NSpan);
const H1 = styled(NH1);
const H2 = styled(NH2);
const H3 = styled(NH3);
const H4 = styled(NH4);
const H5 = styled(NH5);
const H6 = styled(NH6);
const Strong = styled(NStrong);
const Code = styled(NativeCode);
const P = styled(NP);

export { Span, H1, H2, H3, H4, H5, H6, Strong, Code, P };
