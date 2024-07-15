import * as BabelTypes from '@babel/types';

export type BabelCallValue = BabelTypes.CallExpression['arguments'][0];

export interface APICallerOptions {
  engine: string | null;
  isServer: boolean;
  isDev: boolean;
  platform: string;
}
export interface BabelAPI {
  types: typeof BabelTypes;
  caller: <T>(caller: (data?: APICallerOptions) => T) => NonNullable<T>;
  cache: (x: boolean) => void;
}

export interface TwinBabelOptions extends APICallerOptions {
  twinConfigPath?: string;
}
