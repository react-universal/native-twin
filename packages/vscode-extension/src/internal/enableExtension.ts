import * as vscode from 'vscode';
import { Logger, State, SynchronizedConfiguration } from '../types';
import { configurationSection, pluginId, typeScriptExtensionId } from './config';

export async function enableExtension(context: vscode.ExtensionContext, log: Logger) {
  const state: State = { hasUniversalLabs: undefined };

  const update = async () => {
    const localTailwindManifestFiles = await vscode.workspace.findFiles(
      '**/node_modules/@native-twin/preset-tailwind/package.json',
      null,
      1,
    );

    const configFiles = localTailwindManifestFiles.length
      ? []
      : await vscode.workspace.findFiles(
          '**/tailwind.config.{ts,js,mjs,cjs}',
          '**/node_modules/**',
          1,
        );

    let hasUniversalLabs = false;
    if (localTailwindManifestFiles.length) {
      log(`Using local tailwind config`);
      hasUniversalLabs = true;
    } else if (configFiles.length) {
      log(`Using builtin tailwind config`);
      hasUniversalLabs = true;
    } else {
      log(
        `No Native Tailwind package and no tailwind config file found. Not activating tailwind IntelliSense.`,
      );
      hasUniversalLabs = false;
    }

    if (hasUniversalLabs !== state.hasUniversalLabs) {
      state.hasUniversalLabs = hasUniversalLabs;
      synchronizeConfiguration(api, state, log);
    }
  };

  const api = await activateTypescriptPlugin(log);

  const listener = () => {
    update().catch((error) => {
      log(error.stacktrace);
    });
  };

  context.subscriptions.push(
    vscode.commands.registerCommand(`${configurationSection}.restart`, () => {
      state.hasUniversalLabs = undefined;
      listener();
    }),
  );

  const replaceClassNameStrings = () => {
    const editor = vscode.window.activeTextEditor;
    if (editor) {
      const document = editor.document;
      const selection = editor.selection;
      const word = document.getText(selection);
      const replaced = word.replaceAll(/className="([^"].*)"/g, `className={tw\`$1\`}`);
      editor.edit((editBuilder) => {
        editBuilder.replace(selection, replaced);
      });
    }
  };

  context.subscriptions.push(
    vscode.commands.registerCommand(`${configurationSection}.className`, () => {
      replaceClassNameStrings();
    }),
  );

  const configWatcher = vscode.workspace.createFileSystemWatcher(
    '**/tailwind.config.{ts,js,mjs,cjs}',
  );

  context.subscriptions.push(configWatcher);
  context.subscriptions.push(configWatcher.onDidCreate(listener));
  context.subscriptions.push(configWatcher.onDidDelete(listener));

  const packageWatcher = vscode.workspace.createFileSystemWatcher(
    '**/{package,package-lock.json,yarn.lock,pnpm-lock.yaml}',
  );

  context.subscriptions.push(packageWatcher);
  context.subscriptions.push(packageWatcher.onDidCreate(listener));
  context.subscriptions.push(packageWatcher.onDidChange(listener));
  context.subscriptions.push(packageWatcher.onDidDelete(listener));

  await update();
}

async function activateTypescriptPlugin(log: Logger) {
  const extension = vscode.extensions.getExtension(typeScriptExtensionId);
  if (!extension) {
    log(`Extension ${typeScriptExtensionId} not found. No IntelliSense will be provided.`);
    return;
  }

  await extension.activate();

  const api = extension.exports?.getAPI?.(0);

  if (!api) {
    log(
      `Extension ${typeScriptExtensionId} did not export an API. No IntelliSense will be provided.`,
    );
    return;
  }

  return api;
}

function synchronizeConfiguration(api: any, state: State, log: Logger) {
  const config = getConfiguration();

  if (config.enable) {
    log(
      'Extension is enabled. To disable, change the `nativeTwin.enable` setting to `false`.',
    );

    if (state.hasUniversalLabs) {
      log(`Configuring ${pluginId} using: ${JSON.stringify(config, null, 2)}`);
    } else {
      config.enable = false;
    }
  } else {
    log(
      'Extension is disabled. No IntelliSense will be provided. To enable, change the `nativeTwin.enable` setting to `true`.',
    );
  }

  api.configurePlugin(pluginId, config);
}

function getConfiguration(): SynchronizedConfiguration {
  const config = vscode.workspace.getConfiguration(configurationSection);
  const outConfig: SynchronizedConfiguration = {
    tags: ['tw', 'apply', 'css', 'variants'],
    attributes: ['tw', 'class', 'className', 'variants'],
    styles: ['style', 'styled', 'variants'],
    debug: false,
    enable: true,
  };

  withConfigValue<string[]>(config, 'tags', (tags) => {
    outConfig.tags = tags;
  });

  withConfigValue<string[]>(config, 'attributes', (attributes) => {
    outConfig.attributes = attributes;
  });

  withConfigValue<string[]>(config, 'styles', (styles) => {
    outConfig.styles = styles;
  });

  withConfigValue<boolean>(config, 'debug', (debug) => {
    outConfig.debug = debug;
  });

  withConfigValue<boolean>(config, 'enable', (enable) => {
    outConfig.enable = enable;
  });

  return outConfig;
}

function withConfigValue<T>(
  config: vscode.WorkspaceConfiguration,
  key: string,
  withValue: (value: T) => void,
): void {
  const configSetting = config.inspect(key);
  if (!configSetting) {
    return;
  }

  // Make sure the user has actually set the value.
  // VS Code will return the default values instead of `undefined`, even if user has not don't set anything.
  if (
    typeof configSetting.globalValue === 'undefined' &&
    typeof configSetting.workspaceFolderValue === 'undefined' &&
    typeof configSetting.workspaceValue === 'undefined'
  ) {
    return;
  }

  const value = config.get<T | undefined>(key, undefined);
  if (typeof value !== 'undefined') {
    withValue(value);
  }
}
