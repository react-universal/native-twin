import type { BaseTheme, Twind } from '../types';

import { changed } from '../internal/changed';
import { tw as tw$ } from './runtime';

export interface TwindMutationObserver {
  observe: (target: Node) => void;
  disconnect: () => void;
}

/**
 * @group Runtime
 * @param tw
 * @param target
 * @returns
 * @internal
 */
export function mo<Theme extends BaseTheme = BaseTheme, Target = unknown>(
  tw: Twind<Theme, Target>,
): TwindMutationObserver {
  const observer = new MutationObserver(handleMutationRecords);

  return {
    observe(target) {
      observer.observe(target, {
        attributeFilter: ['class'],
        subtree: true,
        childList: true,
      });

      // handle class attribute on target
      handleClassAttributeChange(target as Element);

      // handle children of target
      handleMutationRecords([{ target, type: '' }]);
    },
    disconnect() {
      observer.disconnect();
    },
  };

  function handleMutationRecords(records: MinimalMutationRecord[]): void {
    for (const { type, target } of records) {
      if (type[0] == 'a' /* attribute */) {
        // class attribute has been changed
        handleClassAttributeChange(target as Element);
      } else {
        /* childList */
        // some nodes have been added — find all with a class attribute
        for (const el of (target as Element).querySelectorAll('[class]')) {
          handleClassAttributeChange(el);
        }
      }
    }

    // remove pending mutations — these are triggered by updating the class attributes
    observer.takeRecords();
    // XXX maybe we need to handle all pending mutations
    // observer.takeRecords().forEach(handleMutation)
  }

  function handleClassAttributeChange(target: Element): void {
    // Not using target.classList.value (not supported in all browsers) or target.class (this is an SVGAnimatedString for svg)
    // safe guard access to getAttribute because ShadowRoot does not have attribute but child nodes
    const tokens = target.getAttribute?.('class');

    let className: string;

    // try do keep classNames unmodified
    if (tokens && changed(tokens, (className = tw(tokens)))) {
      // Not using `target.className = ...` as that is read-only for SVGElements
      target.setAttribute('class', className);
    }
  }
}

/**
 * @group Runtime
 * @param tw
 * @param target
 * @returns
 */
export function observe<Theme extends BaseTheme = BaseTheme, Target = unknown>(
  tw: Twind<Theme, Target> = tw$ as unknown as Twind<Theme, Target>,
  target: false | Node = typeof document != 'undefined' && document.documentElement,
): Twind<Theme, Target> {
  if (target) {
    const observer = mo(tw);

    observer.observe(target);

    // monkey patch tw.destroy to disconnect this observer
    const { destroy } = tw;
    tw.destroy = () => {
      observer.disconnect();
      destroy.call(tw);
    };
  }

  return tw;
}

/**
 * Simplified MutationRecord which allows us to pass an
 * ArrayLike (compatible with Array and NodeList) `addedNodes` and
 * omit other properties we are not interested in.
 */
interface MinimalMutationRecord {
  readonly type: string;
  readonly target: Node;
}
