import { matchThemeValue } from '../../theme/rule-resolver';

export const sizeRules = [
  matchThemeValue('aspect-', 'aspectRatio', 'aspectRatio'),
  matchThemeValue('w-', 'width', 'width'),
  matchThemeValue('h-', 'height', 'height'),
  matchThemeValue('max-w-', 'maxWidth', 'maxWidth'),
  matchThemeValue('max-h-', 'maxHeight', 'maxHeight'),
  matchThemeValue('min-w-', 'minWidth', 'minWidth'),
  matchThemeValue('min-h-', 'minHeight', 'minHeight'),
];