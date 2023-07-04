// Common Parsers
import * as p from './Parser';
import { between } from './common/between.parser';
import { choice } from './common/choice.parser';
import * as composed from './common/composed.parsers';
import { coroutine } from './common/coroutine.parser';
import { setData, withData, getData } from './common/data.parser';
import { tapParser } from './common/debug.parser';
import { lookAhead } from './common/lookahead';
import { many, many1 } from './common/many.parser';
import { maybe } from './common/maybe.parser';
import * as number from './common/number.parser';
import { peek } from './common/peek.parser';
import { recursiveParser } from './common/recursive.parser';
import { separatedBy } from './common/separated-by.parser';
import { sequenceOf } from './common/sequence-of';
import { skip } from './common/skip.parser';
import * as string from './common/string.parser';

const parser = {
  ...p,
  between,
  setData,
  many1,
  skip,
  tapParser,
  choice,
  coroutine,
  lookAhead,
  many,
  maybe,
  peek,
  recursiveParser,
  separatedBy,
  sequenceOf,
  withData,
  getData,
};
export { parser, string, number, composed };
