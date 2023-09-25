import * as vscode from 'vscode';
import { LoggerService } from '../shared/logger';

export async function loadTailwindConfig(logger: LoggerService) {
  const localTailwindManifestFiles = await vscode.workspace.findFiles(
    '**/node_modules/@universal-labs/native-tailwind/package.json',
    null,
    1,
  );

  const configFiles = await vscode.workspace.findFiles(
    '**/tailwind.config.{ts,js,mjs,cjs}',
    '**/node_modules/**',
    1,
  );
  let hasUniversalLabs = false;
  if (localTailwindManifestFiles.length) {
    logger.log(`Using local tailwind config`);
    hasUniversalLabs = true;
  } else if (configFiles.length) {
    logger.log(`Using builtin tailwind config`);
    hasUniversalLabs = true;
  } else {
    logger.log(
      `No Native Tailwind package and no tailwind config file found. Not activating tailwind IntelliSense.`,
    );
    hasUniversalLabs = false;
  }

  return {
    hasUniversalLabs,
    configFiles,
    localTailwindManifestFiles,
  };
}
