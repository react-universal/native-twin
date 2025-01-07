import { CodeGenerator } from '@babel/generator';
import type { NodePath } from '@babel/traverse';
import * as t from '@babel/types';
import { cx } from '@native-twin/core';
import { type TWParsedRule, parseTWTokens } from '@native-twin/css';
import { hash } from '@native-twin/helpers';
import * as RA from 'effect/Array';
import * as Hash from 'effect/Hash';
import * as Match from 'effect/Match';
import * as Option from 'effect/Option';
import * as Constants from '../shared/compiler.constants.js';
import * as BabelUtils from '../utils/babel/babel.utils.js';

export interface JSXMappedAttribute {
  value: {
    text: string;
    templateExpression: Option.Option<string>;
    twinRules: TWParsedRule[];
  };
  prop: string;
  target: string;
}

export class TwinJSXElement {
  readonly index: -1 | (number & {});
  readonly id: string;
  constructor(
    readonly ast: NodePath<t.JSXElement>,
    private readonly parent?: TwinJSXElement,
  ) {
    this.index = parent?.childs.indexOf(ast) ?? -1;
    const uid = this.ast.scope.getProgramParent().generateUid();
    const index = Hash.string(`${this.index}-${this.parent?.childsSize ?? -1}`);
    const name = Hash.string(this.name);
    const filename = Hash.string(this.filename);

    this.id = hash(`${uid}-${filename}-${name}-${index}`);
  }

  get childsSize(): -1 | (number & {}) {
    return this.childs.length;
  }

  get filename() {
    return Option.fromNullable(this.ast.node.loc).pipe(
      Option.map((x) => x.filename),
      Option.getOrElse(() => '__Twin___UnnamedFile'),
    );
  }

  get name() {
    return Option.liftPredicate(this.ast.get('openingElement').get('name'), (x) =>
      x.isJSXIdentifier(),
    ).pipe(
      Option.map((x) => x.node.name),
      Option.getOrElse(() => 'Twin_UnknownElement'),
    );
  }

  get mappedProps() {
    return RA.getSomes(
      RA.map(this.attributes, (x) =>
        Option.fromNullable(extractStyledProp(x, this.config)),
      ),
    );
  }

  /**
   * * @internal
   * @domain Babel
   * @description Extract the {@link MappedComponent} from any {@link ValidJSXElementNode}
   * */
  get config() {
    return RA.findFirst(Constants.mappedComponents, (x) => x.name === this.name).pipe(
      Option.getOrElse(() => Constants.createCommonMappedAttribute(this.name)),
    );
  }

  get childs(): NodePath<t.JSXElement>[] {
    return this.ast.get('children').filter((x) => x.isJSXElement());
  }

  get attributes() {
    return BabelUtils.getJSXElementAttrs(this.ast.node);
  }

  get importSource() {
    return Option.liftPredicate(this.ast.get('openingElement').get('name'), (x) =>
      x.isJSXIdentifier(),
    ).pipe(
      Option.flatMap((x) => Option.fromNullable(this.ast.scope.getBinding(x.node.name))),
      Option.flatMap((binding) => BabelUtils.getBabelBindingImportSource(binding)),
      Option.getOrElse(() => ({ kind: 'local', source: 'unknown' })),
    );
  }

  toObject() {
    return {
      id: this.id,
      index: this.index,
      parentID: `${this.parent?.id ?? null}`,
      parentSize: this.parent?.childsSize ?? -1,
    };
  }
}

/**
 * @domain Babel
 * @description Extract the {@link JSXMappedAttribute} from any {@link t.JSXAttribute}
 * */
const extractStyledProp = (
  attribute: t.JSXAttribute,
  config: Constants.MappedComponent,
): JSXMappedAttribute | null => {
  const validClassNames = Object.entries(config.config);
  if (!t.isJSXAttribute(attribute)) return null;
  if (!t.isJSXIdentifier(attribute.name)) return null;
  const className = validClassNames.find((x) => attribute.name.name === x[0]);
  if (!className) return null;

  let ast: t.TemplateLiteral | t.StringLiteral | undefined = undefined;
  const prop = className[0];
  const target = className[1];

  if (t.isStringLiteral(attribute.value)) {
    ast = attribute.value;
  }

  if (t.isJSXExpressionContainer(attribute.value)) {
    if (t.isTemplateLiteral(attribute.value.expression)) {
      ast = attribute.value.expression;
    }
    if (t.isCallExpression(attribute.value.expression)) {
      ast = t.templateLiteral(
        [
          t.templateElement({ raw: '', cooked: '' }),
          t.templateElement({ raw: '', cooked: '' }),
        ],
        [attribute.value.expression],
      );
    }
  }
  if (!ast) return null;

  const { templateExpression, text, twinRules } = getPropValueString(ast);
  return {
    value: {
      text,
      templateExpression,
      twinRules,
    },
    prop,
    target,
  };
};

const getPropValueString = Match.type<t.StringLiteral | t.TemplateLiteral>().pipe(
  Match.when(t.isStringLiteral, (x) => {
    const text = cx`${x.value}`;
    return {
      text,
      twinRules: parseTWTokens(text),
      templateExpression: Option.none<string>(),
    };
  }),
  Match.when(t.isTemplateLiteral, (template) => {
    const cooked = BabelUtils.templateLiteralToStringLike(template);
    const text = cx`${cooked.strings}`;
    return {
      text,
      twinRules: parseTWTokens(text),
      templateExpression: Option.liftPredicate(
        template.expressions,
        (x) => x.length > 0,
      ).pipe(Option.map((x) => new CodeGenerator(cooked.expressions).generate().code)),
    };
  }),
  Match.exhaustive,
);
