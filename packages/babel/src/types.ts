import * as BabelTypes from '@babel/types';

export interface BabelAPI {
  types: typeof BabelTypes;
}

export type BabelCallValue = BabelTypes.CallExpression['arguments'][0];
