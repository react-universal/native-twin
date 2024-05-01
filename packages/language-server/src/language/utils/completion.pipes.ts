import * as Option from 'effect/Option';
import { Position, Range } from 'vscode-languageserver/node';
import { TwinDocument } from '../../documents/document.resource';

export const extractDocumentAndPositions = (
  maybeDocument: Option.Option<TwinDocument>,
  position: Position,
) =>
  Option.Do.pipe(
    Option.bind('document', () => maybeDocument),
    Option.bind('nodeAtPosition', ({ document }) =>
      document.getTemplateNodeAtPosition(position),
    ),
    Option.let('cursorOffset', ({ document }) =>
      document.handler.offsetAt(position),
    ),
    Option.let('cursorPosition', ({ document, cursorOffset }) =>
      document.handler.positionAt(cursorOffset),
    ),
    Option.let('isWhiteSpace', ({ document }) => {
      return (
        document
          .getTextForRange(
            Range.create(
              {
                ...position,
                character: position.character - 1,
              },
              {
                ...position,
                character: position.character + 1,
              },
            ),
          )
          .replaceAll(/\s/g, '') === ''
      );
    }),
  );
