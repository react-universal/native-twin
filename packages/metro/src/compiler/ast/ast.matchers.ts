import * as t from '@babel/types';
import { pipe } from 'effect/Function';
import * as Hash from 'effect/Hash';
import * as Option from 'effect/Option';
import nodePath from 'node:path';
import { AnyPrimitive } from '../ast.types';
import { addAttributeToBabelJSXElement } from '../babel/babel.utils';
import { JSXElementNode } from '../models/JSXElement.model';

export const getJSXNodeOpenElement = (path: t.JSXElement) => {
  return Option.some(path.openingElement);
};

/**
 * @domain Shared Transform
 * @description Add a JSXAttribute to {@link JSXElementNodePath}
 */
export const addAttributeToJSXElement = (
  path: t.JSXElement,
  name: string,
  value: AnyPrimitive,
) => {
  addAttributeToBabelJSXElement(path, name, value);
};

/**
 * @domain Shared Transform
 * @description Create the {@link JSXElementNode} Hash id
 * */
export const createJSXElementNodeHash = (level: string, order: number, path: string) =>
  pipe(
    Hash.number(order),
    Hash.combine(Hash.string(level)),
    Hash.combine(Hash.string(nodePath.basename(path))),
  );
