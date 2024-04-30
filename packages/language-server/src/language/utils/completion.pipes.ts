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
    Option.let('relativePosition', ({ nodeAtPosition, document }) =>
      document.getRelativePosition(
        position.character - nodeAtPosition.range.start.character,
      ),
    ),
    Option.let('relativeOffset', ({ nodeAtPosition, document, relativePosition }) =>
      document.getRelativeOffset(nodeAtPosition, relativePosition),
    ),
    Option.let('isWhiteSpace', ({ document }) => {
      return document
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
        .replaceAll(/\s/g, '') === '';
    }),
  );
