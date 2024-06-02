import { noop } from '@native-twin/helpers';
import { Layer } from '../css/precedence';
import { Sheet, SheetEntry, SheetEntryDeclaration } from './sheet.types';

export function createVirtualSheet(): Sheet<SheetEntry[]> {
  // const utilities = new Set<string>();
  // const mediaRules = new Set<string>();
  const target: SheetEntry[] = [];

  return {
    target,

    clear() {
      target.length = 0;
    },

    destroy() {
      this.clear();
    },

    insert(entry, index) {
      target.splice(index, 0, entry);
    },

    snapshot() {
      // collect current rules
      const rules = [...target];

      return () => {
        target.splice(0, target.length, ...rules);
      };
    },
    insertPreflight(data) {
      const nodes: string[] = [];
      for (const p of Object.entries(data)) {
        const className = p[0];
        const declarations: SheetEntryDeclaration[] = [];
        for (const d of Object.entries(p[1])) {
          declarations.push({
            prop: d[0],
            value: d[1] as any,
          });
        }
        target.push({
          className: className,
          declarations,
          important: false,
          precedence: Layer.b,
          selectors: [],
        });
      }

      return nodes;
    },
    resume: noop,
  };
}
