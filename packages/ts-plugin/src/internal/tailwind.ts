import { Tailwind, presetTailwind } from '@universal-labs/twind-adapter';
import { createIntellisense } from './createIntellisense';
import { defineConfig } from '@twind/core';
import { LanguageServiceContext } from '../ServiceContext';
import { getConfig } from './loadConfig';

export async function populateCompletions(context: LanguageServiceContext) {
  new Tailwind();
  const config = getConfig(
    context.pluginInfo.project,
    context.pluginInfo.languageService.getProgram()?.getCurrentDirectory() ?? process.cwd(),
    'tailwind.config.js',
  );

  const defaultConfig = defineConfig({
    presets: [presetTailwind({ disablePreflight: true })],
  });

  const completions = createIntellisense({
    ...defaultConfig,
    theme: {
      ...defaultConfig.theme,
      // @ts-expect-error
      extend: {
        ...defaultConfig.theme,
        ...config,
      },
    },
  });
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

  if (baseClassName) {
    context.completionEntries.set(baseClassName, {
      name: baseClassName!,
      type: 'class',
      value: className,
      color: '',
      description: '',
      detail: '',
    });
  }
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
