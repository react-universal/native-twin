import { ColorFunctionOptions, ColorValue } from '../theme.types';

function parseColorSection(chars: string, factor: number): number {
  return Math.round(parseInt(chars, 16) * factor);
}
export function colorToColorValue(color: ColorValue, options: ColorFunctionOptions) {
  if (typeof color == 'function') {
    return color(options);
  }
  const { opacityValue = '1', opacityVariable } = options;
  const opacity = opacityVariable ? `var(${opacityVariable})` : opacityValue;

  if (color.includes('<alpha-value>')) {
    return color.replace('<alpha-value>', opacity);
  }

  if (color[0] == '#' && (color.length == 4 || color.length == 7)) {
    const size = (color.length - 1) / 3;
    const factor = [17, 1, 0.062272][size - 1];
    return `rgba(${[
      parseColorSection(color.slice(1, size + 1), factor!),
      parseColorSection(color.slice(1 + size, size + 3), factor!),
      parseColorSection(color.slice(size + 3, size + 5), factor!),
      opacity,
    ]})`;
  }

  if (opacity == '1') return color;
  if (opacity == '0') return '#0000';

  // convert rgb and hsl to alpha variant
  return color.replace(/^(rgb|hsl)(\([^)]+)\)$/, `$1a$2,${opacity})`);
}
