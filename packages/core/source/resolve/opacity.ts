import { TwTheme } from '../types/tw-config';
import { StyleIR } from '../types/types';
import { parseNumericValue, complete } from '../utils/helpers';

export function opacity(value: string, config?: TwTheme['opacity']): StyleIR | null {
  const configValue = config?.[value];
  if (configValue) {
    const parsedConfig = parseNumericValue(String(configValue));
    if (parsedConfig) {
      return complete({ opacity: parsedConfig[0] });
    }
  }
  const parsedArbitrary = parseNumericValue(value);
  if (parsedArbitrary) {
    return complete({ opacity: parsedArbitrary[0] / 100 });
  }

  return null;
}
