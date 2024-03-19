/* eslint-env node */
import { createElement, Fragment } from 'react';
import type { DocumentContext, DocumentInitialProps } from 'next/document';
import Document from 'next/document';
import { extract } from '@native-twin/native-twin';

export { installDocument };

function installDocument(): typeof Document;
function installDocument<Component extends typeof Document = typeof Document>(
  DocumentComponent: Component,
): Component;

function installDocument<Component extends typeof Document = typeof Document>(
  BaseComponent: Component = Document as Component,
): Component {
  // @ts-ignore
  return class NativeTailwindDocument extends BaseComponent {
    // @ts-ignore
    static async getInitialProps(
      ctx: DocumentContext & {
        defaultGetInitialProps: (
          ctx: DocumentContext,
          options?: { nonce?: string },
        ) => Promise<DocumentInitialProps>;
      },
    ) {
      const defaultGetInitialProps = ctx.defaultGetInitialProps.bind(ctx);

      ctx.defaultGetInitialProps = async (ctx, options: { nonce?: string } = {}) => {
        const props = await defaultGetInitialProps(ctx, options);

        const { html, css } = extract(props.html);

        const styles = createElement(
          Fragment,
          null,
          createElement('style', {
            'data-native-twin': '',
            nonce: options.nonce,
            dangerouslySetInnerHTML: {
              __html: css,
            },
          }),
          props.styles,
        );

        return { ...props, html, styles };
      };

      return BaseComponent.getInitialProps(ctx);
    }
  };
}
