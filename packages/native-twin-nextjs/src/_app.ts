/* eslint-env node, browser */
import type { ComponentType } from 'react';
import { createElement } from 'react';
import type { AppProps } from 'next/app';
import type { TailwindConfig, TailwindUserConfig } from '@universal-labs/native-twin';
import { install as install$ } from '@universal-labs/native-twin';

export { installApp };

function installApp(
  config: TailwindConfig<any> | TailwindUserConfig<any>,
): React.JSXElementConstructor<AppProps>;

function installApp<Props, Component>(
  config: TailwindConfig<any> | TailwindUserConfig<any>,
  AppComponent: React.JSXElementConstructor<Props> & Component,
): Component;

function installApp<Props, Component>(
  config: TailwindConfig | TailwindUserConfig,
  AppComponent: React.JSXElementConstructor<Props> & Component = NativeTailwindApp as any,
  isProduction = process.env['NODE_ENV'] == 'production',
): Component {
  if (config.mode !== 'web') {
    install$(Object.assign({ mode: 'web' }, config) as TailwindUserConfig, isProduction);
  } else {
    install$(config as TailwindUserConfig, isProduction);
  }
  return AppComponent;
}

function NativeTailwindApp(props: AppProps) {
  return createElement(props.Component as ComponentType<any>, props.pageProps);
}
