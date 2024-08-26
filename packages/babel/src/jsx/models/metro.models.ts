import type {
  JsTransformerConfig,
  JsTransformOptions,
  TransformResponse,
} from 'metro-transform-worker';
import type { __Theme__, RuntimeTW, TailwindConfig } from '@native-twin/core';
import type { CompilerContext } from '@native-twin/css/jsx';
import type { TailwindPresetTheme } from '@native-twin/preset-tailwind';

export type BabelTransformerFn = (params: {
  src: string;
  filename: string;
  options: BabelTransformerOptions;
}) => Promise<any>;

export interface NativeTwinTransformerOpts extends JsTransformerConfig {
  transformerPath?: string;
  allowedFiles: string[];
  tailwindConfigPath: string;
  outputDir: string;
}

export type TwinTransformFn = (
  config: NativeTwinTransformerOpts,
  projectRoot: string,
  filename: string,
  data: Buffer | string,
  options: JsTransformOptions,
) => Promise<TransformResponse>;

export interface BabelTransformerOptions {
  // customTransformOptions: {
  //   engine: string;
  //   bytecode: boolean;
  //   routerRoot: string;
  // };
  dev: boolean;
  hot: boolean;
  // inlinePlatform: boolean;
  // minify: boolean;
  platform: string;
  // unstable_transformProfile: string;
  // experimentalImportSupport: boolean;
  // unstable_disableES6Transforms: boolean;
  // nonInlinedRequires: string[];
  type: string;
  // enableBabelRCLookup: boolean;
  // enableBabelRuntime: boolean;
  // globalPrefix: string;
  // hermesParser: boolean;
  projectRoot: string;
  // publicPath: string;
}

export interface BabelTransformerConfig {
  options: BabelTransformerOptions;
  filename: string;
  cssOutput: string;
  code: string;
  twin: RuntimeTW;
  twinConfig: TailwindConfig<__Theme__ & TailwindPresetTheme>;
  allowedPaths: string[];
  twinCtx: CompilerContext;
  platform: string;
  generate: {
    tree: boolean;
    componentID: boolean;
    styledProps: boolean;
    templateStyles: boolean;
    order: boolean;
  };
}

export interface TransformWorkerArgs {
  config: NativeTwinTransformerOpts;
  projectRoot: string;
  options: JsTransformOptions;
  cssOutput: string;
  sourceCode: Buffer;
  isDev: boolean;
  filename: string;
  fileType: string;
  platform: string;
}
