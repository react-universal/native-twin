import * as Context from 'effect/Context';
import * as Effect from 'effect/Effect';
import * as HashMap from 'effect/HashMap';
import * as Layer from 'effect/Layer';
import micromatch from 'micromatch';
import path from 'node:path';
import { __Theme__, RuntimeTW } from '@native-twin/core';
import { SheetEntry } from '@native-twin/css';
import { CompilerContext } from '@native-twin/css/jsx';
import { TailwindPresetTheme } from '@native-twin/preset-tailwind';
// import { JSXCompilerService } from '../jsx/jsx.service';
import { JSXElementNode, JSXElementNodeKey } from '../jsx/models/JSXElement.model';
import { getUserTwinConfig, setupNativeTwin } from '../jsx/twin';
import { TwinBabelOptions } from '../types/plugin.types';

export class BabelPluginContext extends Context.Tag('babel/plugin/context')<
  BabelPluginContext,
  {
    rootPath: string;
    options: TwinBabelOptions;
    twin: RuntimeTW<__Theme__ & TailwindPresetTheme, SheetEntry[]>;
    allowedPaths: string[];
    twCtx: CompilerContext;
    isValidFile: (filename?: string) => boolean;
  }
>() {
  static make = (options: TwinBabelOptions, rootPath: string) =>
    Layer.scoped(
      BabelPluginContext,
      Effect.gen(function* () {
        const twConfig = getUserTwinConfig(rootPath, options);
        const twin = setupNativeTwin(twConfig, options);
        const allowedPaths = twConfig.content.map((x) =>
          path.resolve(rootPath, path.join(x)),
        );
        const twCtx: CompilerContext = {
          baseRem: twin.config.root.rem,
          platform: options.platform,
        };

        const visitedElements = HashMap.empty<JSXElementNodeKey, JSXElementNode>();

        return {
          options,
          rootPath,
          twin,
          twConfig: twin.config,
          allowedPaths,
          twCtx,
          visitedElements,
          isValidFile(filename = '') {
            const allowedFileRegex =
              /^(?!.*[/\\](react|react-native|react-native-web|@native-twin\/*)[/\\]).*$/;
            if (!micromatch.isMatch(filename, allowedPaths)) {
              return false;
            }
            return allowedFileRegex.test(filename);
          },
        };
      }),
    );
}
