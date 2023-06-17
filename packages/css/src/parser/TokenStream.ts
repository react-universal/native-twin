import { pipe } from '../pipe.composer';
import * as O from './functional/Option';

/**
 * @category model
 */
export interface Stream {
  readonly buffer: string;
  readonly cursor: number;
}

/**
 * @category constructors
 */
export const stream: (buffer: string, cursor?: number) => Stream = (buffer, cursor = 0) => ({
  buffer,
  cursor,
});

/**
 * @category destructors
 */
export const get: (s: Stream) => O.Option<string> = (s) =>
  s.buffer.at(s.cursor) ? O.some(s.buffer.at(s.cursor)!) : O.none;

/**
 * @category destructors
 */
export const atEnd: (s: Stream) => boolean = (s) => s.cursor >= s.buffer.length;

/**
 * @category destructors
 * @since 0.6.0
 */
export const getAndNext: (s: Stream) => O.Option<{ value: string; next: Stream }> = (s) =>
  pipe(
    get(s),
    O.map((a) => ({ value: a, next: { buffer: s.buffer, cursor: s.cursor + 1 } })),
  );
