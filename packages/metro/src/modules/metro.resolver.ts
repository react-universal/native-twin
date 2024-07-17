import esbuild from 'esbuild';
import type { ResolverConfigT } from 'metro-config';
import path from 'path';
import { MetroConfigInternal } from '../types/metro.types';

export const createMetroResolver = (
  metroConfig: MetroConfigInternal,
): ResolverConfigT['resolveRequest'] => {
  return function resolver(context, moduleName, platform) {
    const resolvedModule = context.resolveRequest(context, moduleName, platform);
    if (resolvedModule.type === 'sourceFile' && moduleName.includes('tailwind.config')) {
      esbuild.buildSync({
        bundle: true,
        entryPoints: [resolvedModule.filePath],
        outdir: path.join(metroConfig.projectRoot, '.twin-cache'),
        external: ['react'],
        platform: 'node',
        target: 'es6',
        keepNames: true,
      });
      const modulePath = path.resolve(
        metroConfig.projectRoot,
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
    const transformedFile = path.resolve(metroConfig.projectRoot, '.twin-cache', moduleName);
    if (context.doesFileExist(transformedFile)) {
      console.log('RESOLVE: ', resolvedModule);
      return context.resolveRequest(context, transformedFile, platform);
    }


    return context.resolveRequest(context, moduleName, platform);
  };
};
