import { Tailwind, presetTailwind, tw } from '@universal-labs/twind-adapter';
import { createIntellisense } from './createIntellisense';
import { TailwindConfig } from '../types';
import { defineConfig } from '@universal-labs/twind-native';
import { LanguageServiceContext } from '../ServiceContext';

export async function populateCompletions(context: LanguageServiceContext) {
  new Tailwind();
  getClasses(tw.config);

  const completions = createIntellisense(
    defineConfig({
      presets: [
        presetTailwind({
          disablePreflight: true,
        }),
      ],
    }),
  );
  const result = await completions.suggest('');
  context.completionEntries.clear();

  result.forEach((className) => {
    addClassNameToCompletions(className.name, context);
  });
  return result;
}

export function addClassNameToCompletions(className: string, context: LanguageServiceContext) {
  // split the variants from the base class name
  // e.g. with `md:hover:text-white`, variants should be `md:` and `hover:`
  const parts = className.split(':');
  const variants = parts.slice(0, -1);
  const baseClassName = parts[parts.length - 1];

  context.completionEntries.set(baseClassName!, {
    name: baseClassName!,
    type: 'class',
    value: className,
    color: '',
    description: '',
    detail: '',
  });
  for (const variant of variants) {
    context.completionEntries.set(`${variant}:`, {
      name: `${variant}:`,
      type: 'variant',
      value: className,
      color: '',
      description: '',
      detail: '',
    });
  }
}

export function getClasses(_config: TailwindConfig) {}
