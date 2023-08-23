import { noop } from '../common/fn.helpers';
import { ThemeConfig } from '../theme/theme.types';
import { BaseTheme, StringLike } from '../types';

interface TwInjector<Theme extends BaseTheme = BaseTheme, Target = unknown> {
  (tokens: StringLike): string;
  readonly target: Target;
  readonly config: ThemeConfig<Theme>;
  snapshot(): () => void;
  clear(): void;
  destroy(): void;
}

let active: TwInjector;

export const tw: TwInjector = new Proxy(noop as unknown as TwInjector<any, any>, {
  apply(_target, _thisArg, args) {
    return active(args[0]);
  },
  get(target, property) {
    const value = active[property as keyof TwInjector];
    if (typeof value === 'function') {
      return value.apply(active, arguments);
    }
    return value;
  },
});
