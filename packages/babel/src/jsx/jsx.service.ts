import { NodePath } from '@babel/traverse';
import * as t from '@babel/types';
import { HashMap } from 'effect';
import * as Context from 'effect/Context';
import { JSXElementNode, JSXElementNodeKey } from './models/JSXElement.model';

export class JSXCompilerService extends Context.Tag('transformer/jsx')<
  JSXCompilerService,
  {
    path: NodePath<t.JSXElement>;
    state: {
      visited: HashMap.HashMap<JSXElementNodeKey, JSXElementNode>;
      filename: string;
    };
  }
>() {}
