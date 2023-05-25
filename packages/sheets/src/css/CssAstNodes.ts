import { normalizeClassNameString } from '../utils/helpers';
import type { RuleNode, Style } from './css.types';
import { parseDeclarations } from './declarations';
import { selectorIsGroupPointerEvent, selectorIsPointerEvent } from './helpers';

export const createCssRuleNode = (selector: string, body: string): RuleNode => {
  const isGroupPointerEvent = selectorIsGroupPointerEvent(selector);
  const isPointerEvent = !isGroupPointerEvent && selectorIsPointerEvent(selector);

  return {
    body,
    selector: normalizeClassNameString(selector),
    isPointerEvent,
    isGroupEvent: isGroupPointerEvent,
    getStyles: (context): Style => parseDeclarations(`${body};`, context),
  };
};
