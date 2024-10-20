import template from '@babel/template';
import * as t from '@babel/types';
import CodeBlockWriter from 'code-block-writer';
import * as RA from 'effect/Array';
import * as Context from 'effect/Context';
import * as Effect from 'effect/Effect';
import { pipe } from 'effect/Function';
import * as HashMap from 'effect/HashMap';
import * as Layer from 'effect/Layer';
import * as Option from 'effect/Option';
import * as Stream from 'effect/Stream';
import { applyParentEntries, RuntimeComponentEntry } from '@native-twin/css/jsx';
import { Tree } from '@native-twin/helpers/tree';
import { NativeTwinServiceNode } from '../../node/native-twin';
import {
  createCommonMappedAttribute,
  MappedComponent,
  mappedComponents,
} from '../../shared/compiler.constants';
import { JSXElementNode } from '../models/JSXElement.model';
import {
  JSXElementTree,
  JSXMappedAttribute,
  RuntimeTreeNode,
} from '../models/jsx.models';
import * as babelPredicates from '../utils/babel.predicates';
import { addJsxAttribute, addJsxExpressionAttribute } from '../utils/jsx.utils';
import { expressionFactory } from '../utils/writer.factory';
import { BabelCompiler } from './Babel.service';

const make = Effect.gen(function* () {
  const babel = yield* BabelCompiler;
  return {
    getTrees: (code: string, filename: string) =>
      babel
        .getAST(code, filename)
        .pipe(Effect.flatMap((x) => babel.getJSXElementTrees(x, filename))),
    getRegistry: (trees: Tree<JSXElementTree>[], filename: string) =>
      getJSXElementRegistry(trees, filename),
    transformTress: transformTrees,
  };
});

export class ReactCompilerService extends Context.Tag('babel/react/compiler')<
  ReactCompilerService,
  Effect.Effect.Success<typeof make>
>() {}

export const layer = Layer.scoped(ReactCompilerService, make);

function addTwinPropsToElement(
  elementNode: JSXElementNode,
  entries: RuntimeComponentEntry[],
  options: {
    componentID: boolean;
    order: boolean;
    styledProps: boolean;
    templateStyles: boolean;
  },
) {
  const stringEntries = entriesToComponentData(elementNode.id, entries);
  const astProps = runtimeEntriesToAst(stringEntries.styledProp);
  // const treeProp = elementNodeToTree(elementNode, filename, elementNode.);

  if (options.componentID) {
    addJsxAttribute(elementNode.path, '_twinComponentID', elementNode.id);
  }

  if (options.order) {
    addJsxAttribute(elementNode.path, '_twinOrd', elementNode.order);
  }

  if (options.styledProps && astProps) {
    addJsxExpressionAttribute(elementNode.path, '_twinComponentSheet', astProps);
  }

  if (options.templateStyles && stringEntries.templateEntries) {
    const astTemplate = runtimeEntriesToAst(stringEntries.templateEntries);
    if (astTemplate) {
      addJsxExpressionAttribute(
        elementNode.path,
        '_twinComponentTemplateEntries',
        astTemplate,
      );
    }
  }
  return astProps;
}

const runtimeEntriesToAst = (entries: string) => {
  const ast = template.ast(entries);
  try {
    let value: t.Expression | undefined;
    if (Array.isArray(ast)) return;

    if (t.isExpressionStatement(ast)) {
      value = ast.expression;
    }

    if (t.isBlockStatement(ast)) {
      const firstBlock = ast.body[0];
      if (t.isExpression(firstBlock)) {
        value = firstBlock;
      }
      if (t.isExpressionStatement(firstBlock)) {
        value = firstBlock.expression;
      }
    }

    if (!value) {
      return null;
    }
    return value;
  } catch {
    return null;
  }
};

// const entriesToComponentData = (id: string) => {
//   const { writer, identifier } = expressionFactory(new CodeBlockWriter());

//   const styledProp = writer
//     .block(() => {
//       // identifier(`require('@native-twin/jsx').StyleSheet.registerComponent("${id}", `);
//       identifier(`globalStyles?.["${id}"]`);
//     })
//     .toString();

//   return {
//     styledProp,
//     templateEntries: null,
//   };
// };

export const entriesToComponentData = (id: string, entries: RuntimeComponentEntry[]) => {
  const { writer, identifier, array } = expressionFactory(new CodeBlockWriter());
  const templateEntries = expressionFactory(new CodeBlockWriter());
  templateEntries.writer.block(() => {
    templateEntries.writer.write('[');
    entries
      .filter((x) => x.templateLiteral)
      .forEach((x) => {
        if (x.templateLiteral) {
          templateEntries.writer.block(() => {
            templateEntries.writer.writeLine(`id: "${id}",`);
            templateEntries.writer.writeLine(`target: "${x.target}",`);
            templateEntries.writer.writeLine(`prop: "${x.prop}",`);
            templateEntries.writer.writeLine(
              `entries: require('@native-twin/core').tw(${x.templateLiteral}),`,
            );
            templateEntries.writer.write(`templateLiteral: ${x.templateLiteral},`);
          });
        }
      });
    templateEntries.writer.write(']');
  });
  const styledProp = writer
    .block(() => {
      identifier(`require('@native-twin/jsx').StyleSheet.registerComponent("${id}", `);
      array(
        entries.map((x) => {
          return {
            templateLiteral: null,
            prop: x.prop,
            target: x.target,
            entries: x.entries,
            rawSheet: x.rawSheet,
          };
        }),
      );
      identifier(`)`);
    })
    .toString();
  return {
    styledProp,
    templateEntries: templateEntries.writer.toString(),
  };
};

const transformTrees = (
  registry: HashMap.HashMap<string, JSXElementNode>,
  platform: string,
) =>
  Effect.gen(function* () {
    if (platform === 'web') {
      return HashMap.empty<string, Omit<RuntimeTreeNode, 'childs'>>();
    }
    return transformJSXElementTree(registry);
  });

const transformJSXElementTree = (trees: HashMap.HashMap<string, JSXElementNode>) => {
  return HashMap.map(trees, (node) => {
    const { leave, runtimeSheet } = getJSXCompiledTreeRuntime(
      node,
      pipe(
        node.parentID,
        Option.flatMap((x) => HashMap.get(trees, x)),
      ),
    );
    const runtimeAST = addTwinPropsToElement(leave, runtimeSheet, {
      componentID: true,
      order: true,
      styledProps: true,
      templateStyles: true,
    });
    return { leave, runtimeSheet, runtimeAST };
  });
};

const getJSXCompiledTreeRuntime = (
  leave: JSXElementNode,
  parentLeave: Option.Option<JSXElementNode>,
) => {
  const runtimeSheet = pipe(
    parentLeave,
    Option.map((parent) =>
      applyParentEntries(
        leave.entries,
        parent.childEntries,
        leave.order,
        leave.parentSize,
      ),
    ),
    Option.getOrElse(() => leave.entries),
  );

  return {
    leave,
    runtimeSheet,
  };
};

const getJSXElementRegistry = (babelTrees: Tree<JSXElementTree>[], filename: string) =>
  pipe(
    Stream.fromIterable(babelTrees),
    Stream.mapEffect((x) => extractSheetsFromTree(x, filename)),
    Stream.map(HashMap.fromIterable),
    Stream.runFold(HashMap.empty<string, JSXElementNode>(), (prev, current) => {
      return pipe(prev, HashMap.union(current));
    }),
  );

export const extractSheetsFromTree = (tree: Tree<JSXElementTree>, fileName: string) =>
  Effect.gen(function* () {
    // const fileSheet = MutableHashMap.empty<string, CompiledTree>();
    const twin = yield* NativeTwinServiceNode;
    // console.groupEnd();
    const fileSheet = RA.empty<[string, JSXElementNode]>();

    tree.traverse((leave) => {
      const { value } = leave;
      const runtimeData = extractMappedAttributes(leave.value.babelNode);
      const model = new JSXElementNode({
        leave,
        order: value.order,
        filename: fileName,
        runtimeData,
        twin,
      });
      fileSheet.push([model.id, model]);
    }, 'breadthFirst');

    return fileSheet;
  });

/**
 * @internal
 * @category Transformer
 * @domain Babel
 * Extract {@link JSXMappedAttribute[]} list from a jsx Attribute
 * */
const getJSXMappedAttributes = (
  attributes: t.JSXAttribute[],
  config: MappedComponent,
): JSXMappedAttribute[] => {
  return attributes
    .map((x) => extractStyledProp(x, config))
    .filter((x) => x !== null) as JSXMappedAttribute[];
};

const getJSXElementName = (
  openingElement: t.JSXOpeningElement,
): Option.Option<string> => {
  if (t.isJSXIdentifier(openingElement.name)) {
    return Option.some(openingElement.name.name);
  }
  return Option.none();
};

/**
 * * @internal
 * @domain Babel
 * @description Extract the {@link MappedComponent} from any {@link ValidJSXElementNode}
 * */
const getJSXElementConfig = (tagName: string) => {
  const componentConfig = mappedComponents.find((x) => x.name === tagName);
  if (!componentConfig) return createCommonMappedAttribute(tagName);

  return componentConfig;
};

/**
 * @category Transformer
 * @domain Babel
 * Extract {@link JSXMappedAttribute[]} list from a jsx Attribute
 * */
const extractMappedAttributes = (node: t.JSXElement): JSXMappedAttribute[] => {
  const attributes = getJSXElementAttrs(node);
  return pipe(
    getJSXElementName(node.openingElement),
    Option.flatMap((x) => Option.fromNullable(getJSXElementConfig(x))),
    Option.map((mapped) => getJSXMappedAttributes(attributes, mapped)),
    Option.getOrElse(() => []),
  );
};

/**
 * @domain Babel
 * @description Extract the {@link t.JSXAttribute[]} from any {@link t.JSXElement}
 * */
const getJSXElementAttrs = (element: t.JSXElement): t.JSXAttribute[] =>
  pipe(element.openingElement.attributes, RA.filter(babelPredicates.isJSXAttribute));

/**
 * @domain Babel
 * @description Extract the {@link JSXMappedAttribute} from any {@link t.JSXAttribute}
 * */
const extractStyledProp = (
  attribute: t.JSXAttribute,
  config: MappedComponent,
): JSXMappedAttribute | null => {
  const validClassNames = Object.entries(config.config);
  if (!t.isJSXAttribute(attribute)) return null;
  if (!t.isJSXIdentifier(attribute.name)) return null;
  const className = validClassNames.find((x) => attribute.name.name === x[0]);
  if (!className) return null;

  if (t.isStringLiteral(attribute.value)) {
    return {
      prop: className[0],
      target: className[1],
      value: attribute.value,
    };
  }
  if (t.isJSXExpressionContainer(attribute.value)) {
    if (t.isTemplateLiteral(attribute.value.expression)) {
      return {
        prop: className[0],
        target: className[1],
        value: attribute.value.expression,
      };
    }
    if (t.isCallExpression(attribute.value.expression)) {
      return {
        prop: className[0],
        target: className[1],
        value: t.templateLiteral(
          [
            t.templateElement({ raw: '', cooked: '' }),
            t.templateElement({ raw: '', cooked: '' }),
          ],
          [attribute.value.expression],
        ),
      };
    }
  }
  return null;
};
