import * as ReadOnlyArray from 'effect/Array';
import { pipe } from 'effect/Function';
import * as Option from 'effect/Option';
import * as vscode from 'vscode-languageserver/node';
import { RuntimeTW } from '@native-twin/core';
import { SheetEntry } from '@native-twin/css';
import { DocumentLanguageRegion } from '../../documents/models/language-region.model';
import { TwinDocument } from '../../documents/models/twin-document.model';
import { VscodeDiagnosticItem } from '../models/diagnostic.model';
import { getFlattenTemplateToken } from './language.utils';

export const diagnosticTokensToDiagnosticItems = (
  document: TwinDocument,
  tokens: DocumentLanguageRegion[],
  tw: RuntimeTW,
) =>
  pipe(
    tokens,
    ReadOnlyArray.flatMap((diagnosticToken) => {
      const text = diagnosticToken.text.replace(/'/g, '');
      const entries = tw(`${text}`);
      const entriesProps = getDiagnosticTokenDeclProps(entries);
      const flatten = diagnosticToken.parsedText.flatMap((x) =>
        getFlattenTemplateToken(x),
      );
      const visited: { className: string; prop: string; index: number }[] = [];
      const r = ReadOnlyArray.reduce(flatten, visited, (prev, current, index) => {
        const itemEntries = current.getSheetEntries(tw);
        const prop = itemEntries.flatMap((x) => x.declarations.map((x) => x.prop)).join();
        if (
          entries.filter((x) => x.declarations.flatMap((x) => x.prop).join() === prop)
            .length > 1
        ) {
          prev.push({
            className: itemEntries.map((x) => x.className).join(),
            prop: prop,
            index,
          });
        }
        // const grouped = ReadOnlyArray.groupBy(b, (x) => x.className);
        // const grouped2 = ReadOnlyArray.groupBy(b, (x) => x.prop);
        // console.log(grouped, grouped2, itemEntries);
        return prev;
      });
      console.log(r);
      return ReadOnlyArray.filterMap(flatten, (item) => {
        const itemEntries = item.getSheetEntries(tw);

        const duplicatedClassNames = itemEntries.filter(
          (x) => entries.filter((y) => y.className === x.className).length > 1,
        );

        const declarationProps = getDiagnosticTokenDeclProps(itemEntries);
        const duplicatedProps = declarationProps.filter(
          (x) =>
            entriesProps.filter(
              (y) =>
                y.prop === x.prop &&
                x.selectors.sort().join(',') === y.selectors.sort().join(','),
            ).length > 1,
        );

        if (duplicatedProps.length) {
          const range = vscode.Range.create(
            document.offsetToPosition(item.token.bodyLoc.start),
            document.offsetToPosition(item.token.bodyLoc.end),
          );
          return Option.some(
            new VscodeDiagnosticItem({
              range,
              kind: 'DUPLICATED_DECLARATION',
              entries: itemEntries,
              uri: document.uri,
              text: item.token.text,
            }),
          );
        }

        if (duplicatedClassNames.length) {
          return Option.some(
            new VscodeDiagnosticItem({
              range: vscode.Range.create(
                document.offsetToPosition(item.token.bodyLoc.start),
                document.offsetToPosition(item.token.bodyLoc.end),
              ),
              kind: 'DUPLICATED_CLASS_NAME',
              entries: itemEntries,
              uri: document.uri,
              text: item.token.text,
            }),
          );
        }
        return Option.none();
      });
    }),
    ReadOnlyArray.dedupe,
  );

export const getDiagnosticTokenDeclProps = (entries: SheetEntry[]) =>
  ReadOnlyArray.flatMap(entries, (x) =>
    x.declarations.map((y) => ({
      prop: y.prop,
      className: x.className,
      selectors: x.selectors,
    })),
  );
