import { MaybeColorValue } from '@universal-labs/twind-adapter';

export function autocompleteColorClassnames(
  colors: Record<string, MaybeColorValue>,
  onColor: (color: string) => void,
) {
  for (const key of Object.keys(colors)) {
    onColor(key);
  }
}
