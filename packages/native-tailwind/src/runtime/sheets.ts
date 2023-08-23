import { noop } from '../common/fn.helpers';

export interface Sheet<Target = unknown> {
  readonly target: Target;
  insert(cssText: string, index: number): void;
  snapshot(): () => void;
  /** Clears all CSS rules from the sheet. */
  clear(): void;
  destroy(): void;
  resume(addClassName: (className: string) => void, insert: (cssText: string) => void): void;
}

/**
 * @group Sheets
 * @param includeResumeData
 * @returns
 */
export function virtual(includeResumeData?: boolean): Sheet<string[]> {
  const target: string[] = [];

  return {
    target,

    snapshot() {
      // collect current rules
      const rules = [...target];

      return () => {
        // remove all existing rules and add all snapshot rules back
        target.splice(0, target.length, ...rules);
      };
    },

    clear() {
      target.length = 0;
    },

    destroy() {
      this.clear();
    },

    insert(css, index) {
      target.splice(index, 0, includeResumeData ? css : css);
    },

    resume: noop,
  };
}
