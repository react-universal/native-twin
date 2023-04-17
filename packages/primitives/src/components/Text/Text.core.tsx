import type { Text } from 'react-native';
import { styled, ForwardedStyledComponent } from '@universal-labs/styled';
import {
  PrimitiveH1,
  PrimitiveH2,
  PrimitiveH3,
  PrimitiveH4,
  PrimitiveH5,
  PrimitiveH6,
} from './HeadingComponents';
import { PrimitiveP, PrimitiveSpan, PrimitiveCode, PrimitiveStrong } from './TextComponents';

const Span = styled(PrimitiveSpan) as ForwardedStyledComponent<typeof Text>;
const H1 = styled(PrimitiveH1) as ForwardedStyledComponent<typeof Text>;
const H2 = styled(PrimitiveH2) as ForwardedStyledComponent<typeof Text>;
const H3 = styled(PrimitiveH3) as ForwardedStyledComponent<typeof Text>;
const H4 = styled(PrimitiveH4) as ForwardedStyledComponent<typeof Text>;
const H5 = styled(PrimitiveH5) as ForwardedStyledComponent<typeof Text>;
const H6 = styled(PrimitiveH6) as ForwardedStyledComponent<typeof Text>;
const Strong = styled(PrimitiveStrong) as ForwardedStyledComponent<typeof Text>;
const Code = styled(PrimitiveCode) as ForwardedStyledComponent<typeof Text>;
const P = styled(PrimitiveP) as ForwardedStyledComponent<typeof Text>;

export { Span, H1, H2, H3, H4, H5, H6, Strong, Code, P };
