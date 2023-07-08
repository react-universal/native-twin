import * as L from '../functional/List';
import type { MonoID } from '../functional/MonoID';
import type { SemiGroup } from '../functional/SemiGroup';

export interface CssSheet {}

export const sheetSemigroup: SemiGroup<CssSheet> = {
  concat: (x, y) => Object.assign(x, y),
};

export const sheetMonoID: MonoID<CssSheet> = { ...sheetSemigroup, empty: { a: '', b: '' } };

export const concatSheet =
  (m: MonoID<CssSheet>) =>
  (xs: L.List<CssSheet>): CssSheet =>
    L.matchList(
      () => {
        return m.empty;
      },
      (head: CssSheet, tail: L.List<CssSheet>): CssSheet =>
        m.concat(head, concatSheet(m)(tail)),
    )(xs);
