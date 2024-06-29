import type * as t from '@babel/types';
import * as ReadonlyArray from 'effect/Array';
import * as Equal from 'effect/Equal';
import { pipe } from 'effect/Function';
import * as Hash from 'effect/Hash';
import type * as VSCDocument from 'vscode-languageserver-textdocument';
import * as vscode from 'vscode-languageserver-types';
import type { RuntimeTW } from '@native-twin/core';
import { parseTemplate } from '../../native-twin/native-twin.parser';

export class DocumentLanguageRegion implements Equal.Equal {
  private constructor(
    readonly range: vscode.Range,
    readonly offset: {
      start: number;
      end: number;
    },
    readonly text: string,
  ) {}

  get regionNodes() {
    return parseTemplate(this.text, this.offset.start);
  }

  get flatRegionNodes() {
    return pipe(
      this.regionNodes,
      ReadonlyArray.flatMap((x) => x.flattenToken),
      ReadonlyArray.dedupe,
    );
  }

  getFullSheetEntries(tw: RuntimeTW) {
    return this.flatRegionNodes.flatMap((x) => x.getSheetEntries(tw));
    // const text = this.text.replace(/'/g, '');
    // return tw(`${text}`).map((x) => new TwinSheetEntry(x));
  }

  getParsedNodeAtOffset(offset: number) {
    return pipe(
      this.regionNodes,
      ReadonlyArray.findFirst(
        (x) => offset >= x.bodyLoc.start && offset <= x.bodyLoc.end,
      ),
    );
  }

  static create(
    document: VSCDocument.TextDocument,
    range: vscode.Range | t.SourceLocation,
  ): DocumentLanguageRegion {
    if (vscode.Range.is(range)) {
      return new DocumentLanguageRegion(
        range,
        {
          start: document.offsetAt(range.start),
          end: document.offsetAt(range.end),
        },
        document.getText(range),
      );
    }
    return this.createForSourceLocation(document, range);
  }

  private static createForSourceLocation(
    document: VSCDocument.TextDocument,
    sourceLocation: t.SourceLocation,
  ) {
    const newRange = vscode.Range.create(
      document.positionAt(sourceLocation.start.index),
      document.positionAt(sourceLocation.end.index),
    );

    return new DocumentLanguageRegion(
      newRange,
      {
        start: document.offsetAt(newRange.start),
        end: document.offsetAt(newRange.end),
      },
      document.getText(newRange),
    );
  }

  [Equal.symbol](that: unknown): boolean {
    return (
      that instanceof DocumentLanguageRegion &&
      this.offset.start === that.offset.start &&
      this.offset.end === that.offset.end &&
      this.range.start.character === that.range.start.character
    );
  }

  [Hash.symbol](): number {
    return Hash.array([this.offset.start, this.offset.end, this.range.start.character]);
  }
}
