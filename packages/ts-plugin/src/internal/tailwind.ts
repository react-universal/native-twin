import { Tailwind, presetTailwind } from '@universal-labs/twind-adapter';
import { createIntellisense } from './createIntellisense';
import { defineConfig } from '@universal-labs/twind-native';
import { LanguageServiceContext } from '../ServiceContext';
import { getConfig } from './loadConfig';
import { inspect } from 'util';

export async function populateCompletions(context: LanguageServiceContext) {
  new Tailwind();
  const config = getConfig(
    context.pluginInfo.project,
    context.pluginInfo.languageService.getProgram()?.getCurrentDirectory() ?? process.cwd(),
    'tailwind.config.js',
  );
  console.log('CONFIG: ', inspect(config, false, null, false));

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
