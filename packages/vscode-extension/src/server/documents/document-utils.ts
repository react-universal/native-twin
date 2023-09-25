/* eslint-disable no-console */
import { TextDocument } from 'vscode-languageserver-textdocument';
import { Position, TextDocumentPositionParams } from 'vscode-languageserver/node';

export function getTemplateLiteralText(
  params: TextDocumentPositionParams,
  document: TextDocument,
) {
  const startPosition: Position = {
    line: params.position.line,
    character: 0,
  };
  const endPosition: Position = {
    line: params.position.line,
    character: params.position.character,
  };

  let word = '';
  let done = false;
  let insideTemplate = false;
  do {
    const text = document.getText({ start: startPosition, end: endPosition });

    if (!insideTemplate) {
      const indexOfStart = text.indexOf('`');
      if (indexOfStart) {
        startPosition.character = indexOfStart;
        insideTemplate = true;
        continue;
      }
    } else {
      word = text;
    }
    console.log('CURRENT_TEXT: ', text);
    done = true;
  } while (!done);
  console.log('TEMPLATE_TEXT: ', word);
}
