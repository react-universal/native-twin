import worker, {
  JsTransformerConfig,
  JsTransformOptions,
  TransformResponse,
} from 'metro-transform-worker';

interface NativeTwinTransformerOpts extends JsTransformerConfig {
  transformerPath?: string;
  allowedFiles: string[];
}
export async function transform(
  config: NativeTwinTransformerOpts,
  projectRoot: string,
  filename: string,
  data: Buffer,
  options: JsTransformOptions,
): Promise<TransformResponse> {
  // const allowedPaths = config.allowedFiles.map((x) => path.resolve(projectRoot, path.join(x)));

  // const transformer = config.transformerPath
  //   ? require(config.transformerPath).transform
  //   : worker.transform;
  // if (!micromatch.isMatch(path.resolve(projectRoot, filename), allowedPaths)) {
  //   // return transformer(config, projectRoot, filename, data, options);
  // }

  // console.log('DATA: ', Buffer.from(data).toString('utf8'));

  // const result = await worker.transform(config, projectRoot, filename, data, options);

  // console.log('\nRESULT: ', result.output);

  return worker.transform(config, projectRoot, filename, data, options);
}
