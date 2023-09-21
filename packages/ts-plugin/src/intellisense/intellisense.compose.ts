import { RuleHandler, parseTWTokens } from '@universal-labs/css/tailwind';
import {
  Rule,
  RuleMeta,
  RuleResolver,
  ThemeContext,
  __Theme__,
  asArray,
  createThemeFunction,
  flattenThemeSection,
} from '@universal-labs/native-tailwind';
import {
  ClassCompletionItem,
  CurrentTheme,
  CompletionItem,
  CompletionItemLocation,
  TailwindConfig,
} from '../types';

// a[1]
// [|0|1|2|3|4|5|5|]
// x00 x01 x02
export function createContextExecutor(
  context: ThemeContext<CurrentTheme>,
  config: TailwindConfig,
) {
  const themeResolver = createThemeFunction(config.theme);
  const suggestions: Map<string, CompletionItem> = new Map();
  // const utilities: Map<string, any> = new Map();

  function ruleExecutor$(rule: Rule<CurrentTheme>, location: CompletionItemLocation) {
    const basePattern = rule[0];
    let resolver: RuleResolver<__Theme__> | undefined;
    let meta: RuleMeta = {
      canBeNegative: false,
      feature: 'default',
    };
    let themeSection: string = '';
    if (typeof rule[1] == 'function') {
      resolver = rule[1];
    }
    if (typeof rule[2] == 'function') {
      resolver = rule[2];
    }
    if (typeof rule[2] == 'object') meta = rule[2];
    if (typeof rule[3] == 'object') meta = rule[3];
    if (typeof rule[1] == 'string') themeSection = rule[1];
    if (typeof rule[2] == 'string') themeSection = rule[2];

    for (const pattern of asArray(basePattern)) {
      const data = flattenThemeSection(config.theme[themeSection]);
      processPattern(pattern, data, themeSection, meta, location, resolver);
    }

    return suggestions;
  }
  return {
    run: ruleExecutor$,
    suggestions,
  };

  function addCompletion(
    input: Pick<ClassCompletionItem, 'name' | 'canBeNegative' | 'theme' | 'isColor'>,
    location: CompletionItemLocation,
  ) {
    suggestions.set(input.name, {
      ...input,
      isColor: input.isColor,
      index: location.index,
      position: location.position++,
      kind: 'class',
    });
    if (input.canBeNegative) {
      const negativeName = input.name.startsWith('-') ? input.name : `-${input.name}`;
      suggestions.set(negativeName, {
        ...input,
        name: negativeName,
        isColor: input.isColor,
        index: location.index,
        position: location.position++,
        kind: 'class',
      });
    }
  }

  function processPattern(
    pattern: string,
    flatten: Record<string, string>,
    themeSection: string,
    meta: RuleMeta,
    location: CompletionItemLocation,
    resolver?: RuleResolver<CurrentTheme>,
  ) {
    const composed = composeClassPatterns(pattern, flatten);
    for (const name of composed) {
      const handler = new RuleHandler(pattern, meta.feature ?? 'default');
      let theme: any = null;
      if (resolver) {
        const parsed = handler.getParser().run(name);
        if (!parsed.isError) {
          for (const c of parseTWTokens(name)) {
            theme = resolver(parsed.result, context, c);
          }
        }
      }
      addCompletion(
        {
          name,
          theme,
          canBeNegative: !!meta.canBeNegative,
          isColor: themeSection == 'colors',
        },
        location,
      );
    }
  }

  function isUncompletedPattern(pattern: string) {
    return pattern.endsWith('-');
  }
}

function composeClassPatterns(prefix: string, themeValue: Object) {
  return Object.keys(themeValue).map((x) => {
    if (x == 'DEFAULT') {
      return prefix.endsWith('-') ? prefix.slice(0, -1) : prefix;
    }
    return `${prefix}${!prefix.endsWith('-') ? '-' : ''}${x}`;
  });
}
