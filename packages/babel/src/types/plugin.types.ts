import { PluginPass } from '@babel/core';
import * as BabelTypes from '@babel/types';
import type { HashMap } from 'effect/HashMap';
import { RawJSXElementTreeNode } from '@native-twin/css/build/jsx';
import { JSXElementNode, JSXElementNodeKey } from '../jsx/models/JSXElement.model';

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

export interface TwinVisitorsState extends PluginPass {
  visited: HashMap<JSXElementNodeKey, JSXElementNode>;
  tree: {
    _tag: 'tree';
    value: RawJSXElementTreeNode[];
  };
}
