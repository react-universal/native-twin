import { NodePath } from '@babel/traverse';
import * as t from '@babel/types';
import * as Context from 'effect/Context';
import * as Effect from 'effect/Effect';
import * as Layer from 'effect/Layer';
import * as Option from 'effect/Option';

export class ReactService extends Context.Tag('ReactService')<
  ReactService,
  {
    // readonly path: NodePath<t.MemberExpression>;
    readonly getCreateElementExpression: (
      path: NodePath<t.MemberExpression>,
    ) => Option.Option<t.MemberExpression>;
    readonly getReactIdent: (
      node: Option.Option<t.MemberExpression>,
    ) => Option.Option<t.Identifier>;
  }
>() {}

export const ReactLive = Layer.scoped(
  ReactService,
  Effect.gen(function* () {
    return {
      getCreateElementExpression(path: NodePath<t.MemberExpression>) {
        if (t.isIdentifier(path.node.property, { name: 'createElement' })) {
          return Option.some(path.node);
        }
        return Option.none();
      },
      getReactIdent(node) {
        return node.pipe(
          Option.flatMap((x) => {
            if (
              t.isIdentifier(x.object, { name: 'react' }) ||
              t.isIdentifier(x.object, { name: 'React' })
            ) {
              return Option.some(x.object);
            }
            if (
              t.isMemberExpression(x.object) &&
              t.isIdentifier(x.object.object, { name: '_react' }) &&
              t.isIdentifier(x.object.property, { name: 'default' })
            ) {
              return Option.some(x.object.object);
            }
            return Option.none();
          }),
        );
      },
    };
  }),
);
