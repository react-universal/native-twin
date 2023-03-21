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

const Span = styled(PrimitiveSpan, {
  baseClassName: 'text-base',
});
const H1 = styled(PrimitiveH1, {
  baseClassName: 'flex text-4xl font-bold',
});
const H2 = styled(PrimitiveH2, {
  baseClassName: 'flex text-3xl font-bold',
});
const H3 = styled(PrimitiveH3, {
  baseClassName: 'flex text-2xl font-bold',
});
const H4 = styled(PrimitiveH4, {
  baseClassName: 'flex text-xl font-bold',
});
const H5 = styled(PrimitiveH5, {
  baseClassName: 'flex text-lg font-bold',
});
const H6 = styled(PrimitiveH6, {
  baseClassName: 'flex text-base font-bold',
});
const Strong = styled(PrimitiveStrong, {
  baseClassName: 'font-bold',
});
const Code = styled(PrimitiveCode);
const P = styled(PrimitiveP, {
  baseClassName: 'my-2 p-1',
});

export { Span, H1, H2, H3, H4, H5, H6, Strong, Code, P };
