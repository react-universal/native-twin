import { ParseCssRules } from '../css/rules.parser';
import * as O from '../functional/Option';
import { createParserState } from '../parsers/Parser';
import type {
  CssParserData,
  ParserState,
  CssParserCache,
  CssNode,
} from '../types/parser.types';

const createSheetStore = () => {
  const store: CssParserCache = new Map();

  return {
    get,
    set,
    has,
  };

  function get(key: string): O.Option<CssNode> {
    const value = store.get(key);
    return value ? O.some(value) : O.none;
  }

  function set(key: string, value: CssNode): O.Option<CssNode> {
    store.set(key, value);
    return get(key);
  }

  function has(key: string) {
    return store.has(key);
  }
};

const createStateManager = (context: CssParserData['context']) => {
  let currentState: ParserState<CssNode | null> = createParserState('', context);
  let rawSheet = ``;
  return {
    get,
    extendState,
    extendRawSheet,
  };

  function get() {
    return currentState;
  }
  function extendState(target: string) {
    const newTarget = extendRawSheet(target);
    currentState.target = newTarget;
    return get();
  }

  function extendRawSheet(input: string) {
    if (rawSheet.includes(input)) {
      return rawSheet;
    }
    rawSheet.concat(rawSheet.length == 0 ? input : `\0${input}`);
    return rawSheet;
  }
};

export const sheetManager = (initialContext: CssParserData['context']) => {
  const store = createSheetStore();
  const stateManager = createStateManager(initialContext);

  return {
    parse,
  };

  function parse(css: string) {
    const state = stateManager.extendState(css);
    const cache = store.has(css);
    if (cache) {
      return store.get(css);
    }
    const nextState = ParseCssRules.run(css, state.data.context);
    if (!nextState.isError) {
      store.set(css, nextState.result!);
      return nextState.result;
    }
    return null;
  }
};
