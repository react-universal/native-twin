import type {
  JsTransformerConfig,
  JsTransformOptions,
  TransformResponse,
} from 'metro-transform-worker';

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
  inputCSS: string;
  outputCSS: string;
}

export type TwinTransformFn = (
  config: NativeTwinTransformerOpts,
  projectRoot: string,
  filename: string,
  data: Buffer,
  options: JsTransformOptions,
) => Promise<TransformResponse>;

export interface BabelTransformerOptions {
  customTransformOptions: {
    routerRoot: string;
    inputCSS: string;
    environment: string;
    baseUrl: string;
  };
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
  outputCSS: string;
  inputCSS: string;
  code: string;

  allowedPaths: string[];

  platform: string;
  generate: {
    tree: boolean;
    componentID: boolean;
    styledProps: boolean;
    templateStyles: boolean;
    order: boolean;
  };
}
