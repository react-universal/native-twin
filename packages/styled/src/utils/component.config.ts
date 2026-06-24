import type {
  ComponentConfig,
  NativeStyleToProp,
  StyledConfiguration,
} from '../types/styled.types';

export function getNormalizeConfig(mapping: StyledConfiguration<any>): ComponentConfig[] {
  const config = new Map<string, ComponentConfig>();

  for (const [source, options] of Object.entries(mapping) as Array<
    [string, StyledConfiguration<any>[string]]
  >) {
    let target: string;
    let nativeStyleToProp: NativeStyleToProp<any> | undefined;

    if (!options) continue;

    if (typeof options === 'boolean') {
      target = source;
    } else if (typeof options === 'string') {
      target = options;
    } else {
      target = typeof options.target === 'boolean' ? source : options.target;
      nativeStyleToProp = options.nativeStyleMapping;
    }

    config.set(target, { target, source, nativeStyleToProp });
  }

  return Array.from(config.values());
}
