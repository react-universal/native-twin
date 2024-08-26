import * as Context from 'effect/Context';
import * as HashMap from 'effect/HashMap';
import { JSXElementNodePath } from './jsx.types';
import { JSXElementNode, JSXElementNodeKey } from './models/JSXElement.model';

export class JSXCompilerService extends Context.Tag('transformer/jsx')<
  JSXCompilerService,
  {
    path: JSXElementNodePath;
    state: {
      visited: HashMap.HashMap<JSXElementNodeKey, JSXElementNode>;
      filename: string;
    };
  }
>() {}
