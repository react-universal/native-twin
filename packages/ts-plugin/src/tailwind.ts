import postcss from 'postcss';
import tailwind from 'tailwindcss';
import { LanguageServiceContext } from './language-service';

// matches either an escaped colon or anything but a colon,
// so we stop at the pseudo-class
const classNameRegex = /\.((?:\\:|[^:\s])+)/gi;

const tailwindDefaultCss = `@tailwind components; @tailwind utilities;`;
export async function populateCompletions(
  context: LanguageServiceContext,
  _configPath: string,
) {
  const parsed = postcss.parse(tailwindDefaultCss);
  const result = await postcss(tailwind({ content: ['_'] })).process(parsed, {
    parser: postcss.parse,
    from: tailwindDefaultCss,
  });
  context.completionEntries.clear();

  result.root?.walkRules((rule) => {
    rule.selector.match(classNameRegex)?.forEach((match) => {
      // remove the dot and escapes
      const className = match.slice(1).replace(/\\/g, '');
      if (className) {
        addClassNameToCompletions(className, context);
      }
    });
  });
  console.log('populateCompletions', context.completionEntries);
  return result;
}

export function addClassNameToCompletions(className: string, context: LanguageServiceContext) {
  // split the variants from the base class name
  // e.g. with `md:hover:text-white`, variants should be `md:` and `hover:`
  const parts = className.split(':');
  const variants = parts.slice(0, -1);
  const baseClassName = parts[parts.length - 1];

  context.completionEntries.set(baseClassName!, { name: baseClassName! });
  for (const variant of variants) {
    context.completionEntries.set(`${variant}:`, { name: `${variant}:` });
  }
}
