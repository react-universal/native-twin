import type { Parser } from '../Parser';
import { sequenceOf } from './sequence-of';

export const between =
  <L>(leftParser: Parser<L>) =>
  <R>(rightParser: Parser<R>) =>
  <T>(parser: Parser<T>): Parser<T> =>
    sequenceOf([leftParser, parser, rightParser]).map(([_, x]) => x);
