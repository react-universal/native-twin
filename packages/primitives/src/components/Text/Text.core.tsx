import styled from '@universal-labs/styled';
import {
  PrimitiveH1,
  PrimitiveH2,
  PrimitiveH3,
  PrimitiveH4,
  PrimitiveH5,
  PrimitiveH6,
} from './HeadingComponents';
import { PrimitiveP, PrimitiveSpan, PrimitiveCode, PrimitiveStrong } from './TextComponents';

const Span = styled(PrimitiveSpan)();
const H1 = styled(PrimitiveH1)();
const H2 = styled(PrimitiveH2)();
const H3 = styled(PrimitiveH3)();
const H4 = styled(PrimitiveH4)();
const H5 = styled(PrimitiveH5)();
const H6 = styled(PrimitiveH6)();
const Strong = styled(PrimitiveStrong)();
const Code = styled(PrimitiveCode)();
const P = styled(PrimitiveP)();

export { Span, H1, H2, H3, H4, H5, H6, Strong, Code, P };
