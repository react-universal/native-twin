import { MaybeArray, ScreenValue } from '@universal-labs/twind-adapter';

export function extractMediaQueries(
  input: {
    screens: Record<string, MaybeArray<ScreenValue>>;
  },
  onMedia: (completion: string) => void,
) {
  const { screens } = input;
  for (const screen of Object.keys(screens)) {
    const name = screen + ':';
    onMedia(name);
  }
}
