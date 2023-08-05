import { MaybeColorValue } from '@universal-labs/twind-adapter';

export function autocompleteColorClassnames(
  colors: Record<string, MaybeColorValue>,
  onColor: (color: string) => void,
) {
  for (const key of Object.keys(colors)) {
    onColor(key);
  }
}

export function autocompleteSpacingRules(
  spacing: Record<string, any>,
  onSpacing: (color: string) => void,
) {
  for (const key of Object.keys(spacing)) {
    onSpacing(key);
  }
}

export function isSpacingFunction(name: string) {
  if (
    name.startsWith('m-') ||
    name.startsWith('mt-') ||
    name.startsWith('ml-') ||
    name.startsWith('mb-') ||
    name.startsWith('mr-') ||
    name.startsWith('mx-') ||
    name.startsWith('my-') ||
    name.startsWith('-m-') ||
    name.startsWith('-mt-') ||
    name.startsWith('-ml-') ||
    name.startsWith('-mb-') ||
    name.startsWith('-mr-') ||
    name.startsWith('-mx-') ||
    name.startsWith('-my-') ||
    name.startsWith('p-') ||
    name.startsWith('pt-') ||
    name.startsWith('pl-') ||
    name.startsWith('pb-') ||
    name.startsWith('pr-') ||
    name.startsWith('px-') ||
    name.startsWith('py-') ||
    name.startsWith('-p-') ||
    name.startsWith('-pt-') ||
    name.startsWith('-pl-') ||
    name.startsWith('-pb-') ||
    name.startsWith('-pr-') ||
    name.startsWith('-px-') ||
    name.startsWith('-py-') ||
    name.startsWith('space-')
  ) {
    return true;
  }
  return false;
}
