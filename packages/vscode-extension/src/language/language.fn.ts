import * as vscode from 'vscode';
import {
  CloseAction,
  ErrorAction,
  ErrorHandler,
  LanguageClientOptions,
  ProvideDocumentColorsSignature,
} from 'vscode-languageclient';
import { CSS_COLORS } from '@native-twin/css/build/css/css.constants';
import {
  DOCUMENT_SELECTORS,
  configurationSection,
} from '../extension/extension.constants';

const colorNames = Object.keys(CSS_COLORS);

export const onLanguageClientError: ErrorHandler['error'] = async (
  _error,
  message,
  count,
) => {
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
      vscode.workspace.textDocuments
        .find((doc) => doc === document)
        ?.getText(color.range) ?? '';
    return new RegExp(
      `-\\[(${colorNames.join('|')}|((?:#|rgba?\\(|hsla?\\())[^\\]]+)\\]$`,
    ).test(text);
  });

  const nonEditableColors = colors.filter((color) => !editableColors.includes(color));

  const editors = vscode.window.visibleTextEditors.filter(
    (editor) => editor.document === document,
  );

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

export const getDefaultLanguageClientOptions = (data: {
  tsConfigFiles: vscode.Uri[];
  twinConfigFile: vscode.Uri | undefined;
  workspaceRoot: vscode.WorkspaceFolder | undefined;
}): LanguageClientOptions => {
  return {
    documentSelector: DOCUMENT_SELECTORS,

    markdown: {
      isTrusted: true,
      supportHtml: true,
    },
    initializationOptions: {
      ...vscode.workspace.getConfiguration(configurationSection),
      ...data,
      capabilities: {
        completion: {
          dynamicRegistration: false,
          completionItem: {
            snippetSupport: true,
          },
        },
      },
    },
    progressOnInitialization: true,
  };
};
