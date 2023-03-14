import { styled } from '@universal-labs/styled';
import {
  PrimitiveH1,
  PrimitiveH2,
  PrimitiveH3,
  PrimitiveH4,
  PrimitiveH5,
  PrimitiveH6,
} from './HeadingComponents';
import { PrimitiveP, PrimitiveSpan, PrimitiveCode, PrimitiveStrong } from './TextComponents';

const Span = styled(PrimitiveSpan, 'text-base');
const H1 = styled(PrimitiveH1, 'text-4xl font-bold');
const H2 = styled(PrimitiveH2, 'text-3xl font-bold');
const H3 = styled(PrimitiveH3, 'text-2xl font-bold');
const H4 = styled(PrimitiveH4, 'text-xl font-bold');
const H5 = styled(PrimitiveH5, 'text-lg font-bold');
const H6 = styled(PrimitiveH6, 'text-base font-bold');
const Strong = styled(PrimitiveStrong, 'font-bold');
const Code = styled(PrimitiveCode);
const P = styled(PrimitiveP, 'my-2 p-1');

export { Span, H1, H2, H3, H4, H5, H6, Strong, Code, P };
