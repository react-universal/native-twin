import type ts from 'typescript/lib/tsserverlibrary';
import type { TailwindPluginConfiguration } from '../config-manager/configuration.context';
import type { Matcher } from '../utils/match';

export const getSourceMatchers = (
  { SyntaxKind }: typeof ts,
  configManager: TailwindPluginConfiguration,
): Matcher[] => [
  // tw`...`
  {
    kind: SyntaxKind.TaggedTemplateExpression,
    // https://github.com/microsoft/typescript-template-language-service-decorator/blob/main/src/nodes.ts#L62
    // TODO styled.button, styled()
    tag: {
      kind: SyntaxKind.Identifier,
      text: configManager.tags,
    },
  },
  // tw(...)
  {
    kind: SyntaxKind.CallExpression,
    // https://github.com/microsoft/typescript-template-language-service-decorator/blob/main/src/nodes.ts#L62
    // TODO styled.button, styled()
    expression: {
      kind: SyntaxKind.Identifier,
      text: configManager.tags,
    },
  },
  // JsxAttribute -> className=""
  {
    kind: SyntaxKind.JsxAttribute,
    name: {
      kind: SyntaxKind.Identifier,
      text: configManager.attributes,
    },
  },
  // { '@apply': `...` }
  {
    // Do not match the @apply property itself
    text: (value: string) => value !== '@apply',
    parent: {
      kind: SyntaxKind.PropertyAssignment,
      name: {
        kind: SyntaxKind.StringLiteral,
        text: '@apply',
      },
    },
  },
  // style({ base: '' })
  {
    kind: SyntaxKind.PropertyAssignment,
    name: {
      kind: [SyntaxKind.Identifier, SyntaxKind.StringLiteral],
      text: 'base',
    },
    // Do not match CSS objects: `base: { color: 'blue' }`
    initializer: (node: ts.Node) => node.kind != SyntaxKind.ObjectLiteralExpression,
    // https://github.com/microsoft/typescript-template-language-service-decorator/blob/main/src/nodes.ts#L62
    // TODO styled.button, styled()
    parent: {
      kind: SyntaxKind.ObjectLiteralExpression,
      parent: {
        kind: SyntaxKind.CallExpression,
        expression: {
          kind: SyntaxKind.Identifier,
          text: configManager.styles,
        },
      },
    },
  },
  // style({ matches: [{ use: '' }] })
  {
    kind: SyntaxKind.PropertyAssignment,
    name: {
      kind: [SyntaxKind.Identifier, SyntaxKind.StringLiteral],
      text: 'use',
    },
    // Do not match CSS objects: `use: { color: 'blue' }`
    initializer: (node: ts.Node) => node.kind !== SyntaxKind.ObjectLiteralExpression,
    parent: {
      kind: SyntaxKind.ObjectLiteralExpression,
      parent: {
        kind: SyntaxKind.ArrayLiteralExpression,
        parent: {
          kind: SyntaxKind.PropertyAssignment,
          name: {
            kind: [SyntaxKind.Identifier, SyntaxKind.StringLiteral],
            text: 'matches',
          },
          // https://github.com/microsoft/typescript-template-language-service-decorator/blob/main/src/nodes.ts#L62
          // TODO styled.button, styled()
          parent: {
            kind: SyntaxKind.ObjectLiteralExpression,
            parent: {
              kind: SyntaxKind.CallExpression,
              expression: {
                kind: SyntaxKind.Identifier,
                text: configManager.styles,
              },
            },
          },
        },
      },
    },
  },
  // style({ variants: { [...]: { [...]: '...' }} })
  {
    kind: SyntaxKind.PropertyAssignment,
    // Do not match CSS objects
    initializer: (node: ts.Node) => node.kind != SyntaxKind.ObjectLiteralExpression,
    parent: {
      kind: SyntaxKind.ObjectLiteralExpression,
      parent: {
        kind: SyntaxKind.PropertyAssignment,
        parent: {
          kind: SyntaxKind.ObjectLiteralExpression,
          parent: {
            kind: SyntaxKind.PropertyAssignment,
            name: {
              kind: [SyntaxKind.Identifier, SyntaxKind.StringLiteral],
              text: 'variants',
            },
            // https://github.com/microsoft/typescript-template-language-service-decorator/blob/main/src/nodes.ts#L62
            // TODO styled.button, styled()
            parent: {
              kind: SyntaxKind.ObjectLiteralExpression,
              parent: {
                kind: SyntaxKind.CallExpression,
                expression: {
                  kind: SyntaxKind.Identifier,
                  text: configManager.styles,
                },
              },
            },
          },
        },
      },
    },
  },
  // Debug helper
  // (value: ts.Node): boolean => {
  //   if (value?.kind == SyntaxKind.JsxAttribute) {
  //     console.log()
  //     console.log(value.kind, value.getText())
  //     console.log(Object.keys(value))
  //     console.log((value as any).name.kind, (value as any).name.text)
  //     // console.log((value as any).name?.kind)

  //     // console.log(value.parent.kind, value.getText())
  //     console.log()
  //   }
  //   return false
  // },
];
