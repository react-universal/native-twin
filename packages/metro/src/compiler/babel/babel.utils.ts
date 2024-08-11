import * as t from '@babel/types';
import { pipe } from 'effect/Function';
import * as Option from 'effect/Option';
import { AnyPrimitive } from '../ast.types';
import {
  addAttributesToElement,
  getBabelJSXElementAttrByName,
  getBabelJSXElementAttrs,
} from './babel.constructors';

export const addAttributeToBabelJSXElement = (
  node: t.JSXElement,
  name: string,
  value: AnyPrimitive,
) =>
  pipe(
    node,
    (x) => getBabelJSXElementAttrs(x),
    (attrs) => getBabelJSXElementAttrByName(attrs, name),
    Option.match({
      onSome: () => void {},
      onNone: () => addAttributesToElement(node, { name, value }),
    }),
  );
