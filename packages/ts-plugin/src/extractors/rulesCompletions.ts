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

export function extractRuleModifiers(
  input: {
    prefix: string;
    themeValue: Record<string, any>;
  },
  onModifier: (modifier: string) => void,
) {
  for (const key of Object.keys(input.themeValue)) {
    onModifier(`${input.prefix}${key}`);
  }
}

export function getRuleSection(name: string) {
  switch (name) {
    case 'm-':
    case 'mt-':
    case 'ml-':
    case 'mb-':
    case 'mr-':
    case 'mx-':
    case 'my-':
    case '-m-':
    case '-mt-':
    case '-ml-':
    case '-mb-':
    case '-mr-':
    case '-mx-':
    case '-my-':
    case 'p-':
    case 'pt-':
    case 'pl-':
    case 'pb-':
    case 'pr-':
    case 'px-':
    case 'py-':
    case '-p-':
    case '-pt-':
    case '-pl-':
    case '-pb-':
    case '-pr-':
    case '-px-':
    case '-py-':
      return 'spacing';

    case 'leading-':
      return 'lineHeight';

    case 'h-':
      return 'height';
    case 'min-h-':
      return 'minHeight';
    case 'max-h-':
      return 'maxHeight';

    case 'w-':
      return 'width';
    case 'min-w-':
      return 'minWidth';
    case 'max-w-':
      return 'maxWidth';

    case 'flex-':
      return 'flex';

    case 'aspect-':
      return 'aspectRatio';

    default:
      return null;
  }
}
