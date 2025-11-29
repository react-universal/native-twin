import type * as vscode from 'vscode';
import * as Data from 'effect/Data';
import * as VSCDocument from 'vscode-languageserver-textdocument';
import { BaseTwinTextDocument } from './BaseTwinDocument';

interface TwinTokenLocation {
  _tag: 'TwinTokenLocation';
  range: vscode.Range;
  offset: {
    start: number;
    end: number;
  };
  text: string;
}

export const TwinTokenLocation = Data.tagged<TwinTokenLocation>('TwinTokenLocation');

export class TwinMonacoTextDocument extends BaseTwinTextDocument {
  constructor(document: VSCDocument.TextDocument | vscode.TextDocument) {
    super(
      VSCDocument.TextDocument.create(
        document.uri.toString(),
        document.languageId,
        document.version,
        document.getText(),
      ),
    );
  }
}
