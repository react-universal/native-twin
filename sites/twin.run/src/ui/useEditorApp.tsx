import * as vscode from 'vscode';
import { cx } from '@native-twin/core';
// import * as RA from "effect/Array";
import * as Effect from 'effect/Effect';
import * as Fiber from 'effect/Fiber';
import { ConsoleLogger } from 'monaco-languageclient/common';
import type { EditorApp, EditorAppConfig } from 'monaco-languageclient/editorApp';
// import * as monaco from "monaco-editor";
import { useEffect, useRef, useState } from 'react';
import { MonacoRuntime } from '../services/App.runtime';
import { MonacoContext } from '../services/Monaco.service';
import { debugLogging } from '../utils/editor.utils';
import { editorStore, subscribeCurrentEditor, useStoreSelector } from './Editor.store';

export const useEditorApp = () => {
  const editorRef = useRef<HTMLDivElement>(null);
  const editorAppRef = useRef<EditorApp>(undefined);
  const containerRef = useRef<HTMLDivElement>(null);
  const modifiedCodeUriRef = useRef<string>(undefined);
  const modifiedCodeRef = useRef<string>(undefined);
  const originalCodeUriRef = useRef<string>(undefined);
  const originalCodeRef = useRef<string>(undefined);
  // const onTextChangedRef = useRef(onTextChanged);
  const launchingRef = useRef<boolean>(false);
  const editorAppConfigRef = useRef<EditorAppConfig>(undefined);
  const triggerReprocessConfigRef = useRef<number>(0);
  const enforceLanguageClientDisposeRef = useRef<boolean>(undefined);

  const performErrorHandling = (error: Error) => {
    debugLogging(`ERROR: ${error.message}`);
    debugLogging(`INTERCEPTED Error: ${error}. Stopping queue...`);
    // runQueueLock = false;
    throw error;
  };

  return {
    editorRef,
  };
};

// const edits = regions.map((x) => {
//   const monacoRange = monaco.Range.fromPositions(
//     {
//       column: x.range.start.character + 1,
//       lineNumber: x.range.start.line + 1,
//     },
//     {
//       column: x.range.end.character + 1,
//       lineNumber: x.range.end.line + 1,
//     }
//   );
//   const vscodeRange = new vscode.Range(
//     new vscode.Position(
//       x.range.start.line,
//       x.range.start.character
//     ),
//     new vscode.Position(x.range.end.line, x.range.end.character)
//   );

//   const monacoEdit: monaco.editor.ISingleEditOperation = {
//     range: monacoRange,
//     text: cx`${model.getValueInRange(monacoRange)}`,
//     forceMoveMarkers: true,
//   };
//   const vscodeEdit = vscode.TextEdit.replace(
//     vscodeRange,
//     document.getText(vscodeRange)
//   );

//   return {
//     token: x,
//     vscodeRange,
//     monacoRange,
//     vscodeText: document.getText(vscodeRange),
//     monacoText: model.getValueInRange(monacoRange),
//     monacoEdit,
//     vscodeEdit,
//   };
// });
