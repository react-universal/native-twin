import * as vscode from 'vscode';
import { CSS_COLORS } from '@native-twin/css';
import { LSPConstants, type TwinConfigOptions } from '@native-twin/language-service';
import * as Effect from 'effect/Effect';
import {
  CloseAction,
  ErrorAction,
  type ErrorHandler,
  type LanguageClientOptions,
  type ProvideDocumentColorsSignature,
} from 'vscode-languageclient';
import { thenable } from '../../extension/extension.utils';

export const createFileWatchers = Effect.gen(function* () {
  return yield* Effect.acquireRelease(
    Effect.sync(() =>
      vscode.workspace.createFileSystemWatcher('**/tailwind.config.*', false, false),
    ),
    (watcher) =>
      Effect.sync(() => {
        console.log('WATCH_FILES_DISPOSED');
        return watcher.dispose();
      }),
  );
});

export const getConfigFiles = Effect.gen(function* () {
  const files = yield* thenable(() =>
    vscode.workspace.findFiles(
      '**/{tailwind,twin,nativeTwin,native-twin}.config.{ts,js,mjs,cjs}',
      '**/node_modules/**',
      1,
    ),
  );
  if (files.length === 0) {
    yield* Effect.logWarning('Cant find a native-twin configuration file');
  }

  return files;
});

export const getColorDecoration = Effect.sync(() =>
  vscode.window.createTextEditorDecorationType({
    before: {
      width: '0.8em',
      height: '0.8em',
      contentText: ' ',
      border: '0.1em solid',
      margin: '0.1em 0.2em 0',
    },
    dark: {
      before: {
        borderColor: '#eeeeee',
      },
    },
    light: {
      before: {
        borderColor: '#000000',
      },
    },
  }),
);

const colorNames = Object.keys(CSS_COLORS);

export const onLanguageClientError: ErrorHandler['error'] = async (_error, message, count) => {
  return {
    action: ErrorAction.Shutdown,
    handled: true,
    message: `${message ?? 'Language client error'} Count: ${count}`,
  };
};

export const onLanguageClientClosed: ErrorHandler['closed'] = async () => {
  return {
    action: CloseAction.Restart,
    handled: true,
    message: 'Language client closed',
  };
};

export const onProvideDocumentColors = async (
  document: vscode.TextDocument,
  token: vscode.CancellationToken,
  next: ProvideDocumentColorsSignature,
  colorDecoration: vscode.TextEditorDecorationType,
): Promise<vscode.ProviderResult<vscode.ColorInformation[]>> => {
  const colors = await next(document, token);
  if (!colors) return colors;

  const editableColors = colors.filter((color) => {
    const text =
      vscode.workspace.textDocuments.find((doc) => doc === document)?.getText(color.range) ?? '';
    return new RegExp(`-\\[(${colorNames.join('|')}|((?:#|rgba?\\(|hsla?\\())[^\\]]+)\\]$`).test(
      text,
    );
  });

  const nonEditableColors = colors.filter((color) => !editableColors.includes(color));

  const editors = vscode.window.visibleTextEditors.filter((editor) => editor.document === document);

  for (const editor of editors) {
    editor.setDecorations(
      colorDecoration,
      nonEditableColors.map(({ color, range }) => ({
        range: range,
        renderOptions: {
          before: {
            backgroundColor: `rgba(${color.red * 255}, ${color.green * 255}, ${color.blue * 255}, ${color.alpha})`,
          },
        },
      })),
    );
  }

  return editableColors;
};

export const getDefaultLanguageClientOptions = (data: TwinConfigOptions): LanguageClientOptions => {
  return {
    documentSelector: LSPConstants.documentSelectors,
    markdown: {
      isTrusted: true,
      supportHtml: true,
    },
    initializationOptions: {
      ...data,
      ...vscode.workspace.getConfiguration(LSPConstants.vscodeConfigSection),
      workspaceRoot: data.rootDir,
      capabilities: {
        completion: {
          dynamicRegistration: false,
          resolveProvider: true,
          completionItem: {
            snippetSupport: true,
          },
        },
      },
    },
    progressOnInitialization: true,
  } satisfies LanguageClientOptions;
};
