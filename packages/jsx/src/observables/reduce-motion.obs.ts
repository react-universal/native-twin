import { AccessibilityInfo } from 'react-native';
import { INTERNAL_RESET } from '../constants';
import { observable } from '../utils/observable';

/**
 * isReduceMotionEnabled
 */
export const isReduceMotionEnabled = Object.assign(
  observable<boolean>(false, { name: 'isReduceMotionEnabled' }),
  { [INTERNAL_RESET]: () => isReduceMotionEnabled.set(false) },
);
// Hopefully this resolves before the first paint...
AccessibilityInfo.isReduceMotionEnabled()?.then(isReduceMotionEnabled.set);
AccessibilityInfo.addEventListener('reduceMotionChanged', (value) => {
  isReduceMotionEnabled.set(value);
});
