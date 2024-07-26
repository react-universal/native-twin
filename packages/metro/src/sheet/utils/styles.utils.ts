import type {
  RuntimeComponentEntry,
  StyledPropEntries,
} from '@native-twin/babel/build/jsx';
import { getRuleSelectorGroup } from '@native-twin/css';

export function getEntryGroups(
  classProps: StyledPropEntries,
): RuntimeComponentEntry['metadata'] {
  return classProps.entries
    .map((x) => [x.className, ...x.selectors])
    .reduce(
      (prev, current): RuntimeComponentEntry['metadata'] => {
        const selector = getRuleSelectorGroup(current);
        if (current.includes('group')) {
          prev.isGroupParent = true;
        }
        if (selector === 'group') {
          prev.hasGroupEvents = true;
        }
        if (selector === 'pointer') {
          prev.hasPointerEvents = true;
        }

        return prev;
      },
      {
        hasAnimations: false,
        hasGroupEvents: false,
        hasPointerEvents: false,
        isGroupParent: false,
      } as RuntimeComponentEntry['metadata'],
    );
}
