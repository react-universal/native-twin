import type { ComponentType } from 'react';
import { createElement } from 'react';
import type { TwindConfig, TwindUserConfig } from '@twind/core';
import { install as install$ } from '@twind/core';
import type { AppProps } from 'next/app';

export default install;

function install(
  config: TwindConfig<any> | TwindUserConfig<any>,
): React.JSXElementConstructor<AppProps>;

function install<Props, Component>(
  config: TwindConfig<any> | TwindUserConfig<any>,
  AppComponent: React.JSXElementConstructor<Props> & Component,
  isProduction?: boolean,
): Component;

function install<Props, Component>(
  config: TwindConfig | TwindUserConfig,
  AppComponent: React.JSXElementConstructor<Props> & Component = TwindApp as any,
  isProduction = process.env['NODE_ENV'] == 'production',
): Component {
  install$(config as TwindUserConfig, isProduction);

  return AppComponent;
}

function TwindApp(props: AppProps) {
  return createElement(props.Component as ComponentType<any>, props.pageProps);
}
