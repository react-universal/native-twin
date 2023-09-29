/* eslint-env node, browser */
import type { ComponentType } from 'react';
import { createElement } from 'react';
import type { TailwindConfig, TailwindUserConfig } from '@universal-labs/native-tailwind';
import { install as install$ } from '@universal-labs/native-tailwind';
import type { AppProps } from 'next/app';

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
): Component {
  install$(config as TailwindUserConfig);
  return AppComponent;
}

function NativeTailwindApp(props: AppProps) {
  return createElement(props.Component as ComponentType<any>, props.pageProps);
}
