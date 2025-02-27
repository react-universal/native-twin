import type { CompilerStyleSheet } from '../StyleSheet';

export type TwinRunnerPlatform = 'web' | 'native';

export interface Extractors {
  native: CompilerStyleSheet;
  web: CompilerStyleSheet;
}
