import type { FlexStyle } from 'react-native';
import { evaluateDimensionsNode } from '../../evaluators/dimensions.evaluator';
import { composed } from '../../lib';
import { CssDimensionsParser } from '../dimensions.parser';

export const FlexToken = composed
  .separatedBySpace(CssDimensionsParser)
  .mapFromData((x): FlexStyle => {
    return x.result.reduce(
      (prev, current, index) => {
        if (index === 0) {
          prev.flexShrink = evaluateDimensionsNode(current, x.data);
        }
        if (index === 1) {
          prev.flexShrink = evaluateDimensionsNode(current, x.data);
        }
        if (index === 2) {
          prev.flexBasis = evaluateDimensionsNode(current, x.data);
        }
        return prev;
      },
      {
        flexGrow: 1,
        flexShrink: 1,
        flexBasis: '0%',
      } as FlexStyle,
    );
  });
