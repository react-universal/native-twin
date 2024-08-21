import type { __Theme__, RuntimeTW, TailwindConfig } from '@native-twin/core';
import { CompilerContext } from '@native-twin/css/jsx';
import type { TailwindPresetTheme } from '@native-twin/preset-tailwind';

export type BabelTransformerFn = (params: {
  src: string;
  filename: string;
  options: BabelTransformerOptions;
}) => Promise<any>;

export interface BabelTransformerOptions {
  customTransformOptions: {
    engine: string;
    bytecode: boolean;
    routerRoot: string;
  };
  dev: boolean;
  hot: boolean;
  inlinePlatform: boolean;
  minify: boolean;
  platform: string;
  unstable_transformProfile: string;
  experimentalImportSupport: boolean;
  unstable_disableES6Transforms: boolean;
  nonInlinedRequires: string[];
  type: string;
  enableBabelRCLookup: boolean;
  enableBabelRuntime: boolean;
  globalPrefix: string;
  hermesParser: boolean;
  projectRoot: string;
  publicPath: string;
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
}
