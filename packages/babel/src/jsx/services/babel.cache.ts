import * as Context from 'effect/Context';
import { pipe } from 'effect/Function';
import * as Layer from 'effect/Layer';
import * as MutableHashMap from 'effect/MutableHashMap';
import * as Option from 'effect/Option';
import { RawJSXElementTreeNode } from '@native-twin/css/jsx';
import { TwinBabelFile } from '../models/BabelFile.model';

export const babelCache = MutableHashMap.empty<string, TwinBabelFile>();

const getOrSetBabelFile = (file: TwinBabelFile['data'], tree: RawJSXElementTreeNode) => {
  return pipe(
    babelCache,
    MutableHashMap.get(file.filename),
    Option.getOrElse(() => {
      const newFile = new TwinBabelFile(file, tree);
      pipe(babelCache, MutableHashMap.set(file.filename, newFile));
      return newFile;
    }),
  );
};

export class BabelCacheContext extends Context.Tag('transformer/babel-cache-context')<
  BabelCacheContext,
  {
    cache: MutableHashMap.MutableHashMap<string, TwinBabelFile>;
    getOrSetBabelFile: (
      file: TwinBabelFile['data'],
      tree: RawJSXElementTreeNode,
    ) => TwinBabelFile;
  }
>() {
  static Live = Layer.succeed(BabelCacheContext, {
    cache: babelCache,
    getOrSetBabelFile,
  });
}
