import type { ResolverConfigT } from 'metro-config';
import micromatch from 'micromatch';
import path from 'path';
import type { MetroConfigInternal } from '../../metro.types';

export const createMetroResolver = (
  metroConfig: ResolverConfigT,
  config: MetroConfigInternal,
  allowedPaths: string[],
): ResolverConfigT => {
  return {
    ...metroConfig,
    sourceExts: [...metroConfig.sourceExts, 'css'],
    resolveRequest(context, moduleName, platform) {
      platform = platform || 'native';

      const resolvedModule = context.resolveRequest(context, moduleName, platform);

      if (
        resolvedModule.type === 'sourceFile' &&
        !micromatch.isMatch(path.resolve(resolvedModule.filePath), allowedPaths)
      ) {
        return resolvedModule;
      }
      if (
        resolvedModule.type === 'sourceFile' &&
        moduleName.includes('tailwind.config')
      ) {
        const modulePath = path.resolve(
          config.projectRoot,
          '.twin-cache',
          'tailwind.config.js',
        );

        if (context.doesFileExist(modulePath)) {
          const resolved = context.resolveRequest(context, modulePath, platform);
          if (resolved.type === 'sourceFile') {
            return resolved;
          }
        }
      }
      const transformedFile = path.resolve(config.projectRoot, '.twin-cache', moduleName);
      if (context.doesFileExist(transformedFile)) {
        return context.resolveRequest(context, transformedFile, platform);
      }

      return context.resolveRequest(context, moduleName, platform);
    },
  };
};
