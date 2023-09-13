import {
  AutocompleteContext,
  MatchResult,
  Rule,
  RuleResolver,
  RuleResult,
  ThemeConfig,
  ThemeFunction,
  asArray,
  escape,
} from '@twind/core';
import genex from 'genex';
import { ConfigurationManager } from '../language-service/configuration';
import {
  ClassCompletionItem,
  CurrentTheme,
  CompletionItem,
  CompletionItemLocation,
} from '../types';
import { isSpacingFunction, toCondition } from '../utils';
import { makeThemeFunction } from './theme';

// a[1]
// [|0|1|2|3|4|5|5|]
// x00 x01 x02
export function createContextExecutor(
  context: AutocompleteContext<CurrentTheme>,
  theme: ThemeConfig<CurrentTheme>,
) {
  const themeResolver = makeThemeFunction<CurrentTheme>(theme as ThemeConfig<CurrentTheme>);
  const suggestions: Map<string, CompletionItem> = new Map();
  // const utilities: Map<string, any> = new Map();

  function ruleExecutor$(rule: Rule<CurrentTheme>, location: CompletionItemLocation) {
    const [rawPattern, resolver] = asArray(rule);
    const ruleResolver = typeof resolver == 'function' ? resolver : undefined;

    for (const pattern of asArray(rawPattern)) {
      if (pattern === ConfigurationManager.VARIANT_MARKER_RULE) {
        continue;
      }
      const condition = toCondition(pattern);
      const re = new RegExp(condition.source.replace(/\\[dw][*+?]*/g, '\0'), condition.flags);
      const generator = genex(re);
      const count = generator.count();
      const canBeNegative = canBeNegativePattern(re.source);

      if (count === Infinity) {
        const generatedList = generator.generate();
        let generated: string = '';
        if (generatedList.length) {
          generated = generatedList[0]?.replace('\x00', '') ?? '';
        }
        const match: MatchResult = Object.create([String(generated)], {
          index: { value: 0 },
          input: { value: String(generated) },
          $$: { value: '' },
        });
        if (ruleResolver) {
          processRuleWithResolver(generated, match, canBeNegative, ruleResolver, location);
        }
      }

      if (count !== Infinity) {
        generator.generate((generatedPattern) => {
          const match = re.exec(generatedPattern) as MatchResult | null;
          if (match) {
            match.$$ = generatedPattern.slice(match[0]!.length);
            const base = generatedPattern.replace(/\0/g, '');
            // console.log('MATCH: ', base, match);
            const isUncompleted = isUncompletedPattern(base);
            // 2086
            if (ruleResolver) {
              processPattern(base, match, location, canBeNegative, ruleResolver);
            }
            if (!ruleResolver) {
              processPattern(base, match, location, canBeNegative);
            }
            if (!isUncompleted) {
              addCompletion(
                { canBeNegative, name: base, theme: null, isColor: false },
                location,
              );
              processPattern(base, match, location, canBeNegative);
            }
            if (isUncompleted && !ruleResolver) {
              // console.log('UNCOMPLETED: ', pattern);
            }
          }
        });
      }
    }

    return suggestions;
  }
  let logged = false;
  return {
    run: ruleExecutor$,
    suggestions,
  };

  function addCompletion(
    input: Pick<ClassCompletionItem, 'name' | 'canBeNegative' | 'theme' | 'isColor'>,
    location: CompletionItemLocation,
  ) {
    // const name = input.name.replace(/-/g, '.');
    // console.log('INPUT: ', name);
    // const resolved = context.theme(input.name);
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
    match: MatchResult,
    location: CompletionItemLocation,
    canBeNegative: boolean,
    resolver?: RuleResolver<CurrentTheme>,
  ) {
    if (pattern.endsWith('-opacity-')) {
      const [base] = pattern.split('-');
      const composed = composeClassPatterns(base!, context.theme('colors'));
      for (const name of composed) {
        addCompletion({ name, theme: null, canBeNegative, isColor: true }, location);
      }
    }
    if (isSpacingFunction(pattern)) {
      const composed = composeClassPatterns(pattern, context.theme('spacing'));
      for (const name of composed) {
        addCompletion({ name, theme: null, canBeNegative, isColor: false }, location);
      }
    }
    const aliasLookup = alias(pattern, context.theme);
    for (const name of aliasLookup) {
      addCompletion({ name, theme: null, canBeNegative, isColor: false }, location);
    }
    if (resolver) {
      processRuleWithResolver(pattern, match, canBeNegative, resolver, location);
    } else {
      const composed = composeClassDetails(pattern, undefined, context);
      for (const name of composed) {
        addCompletion({ name, theme: null, canBeNegative, isColor: false }, location);
      }
    }
  }

  function processRuleWithResolver(
    pattern: string,
    match: MatchResult,
    canBeNegative: boolean,
    resolver: RuleResolver<CurrentTheme>,
    location: CompletionItemLocation,
  ) {
    const resolved = getClassNameDetails(match, resolver);
    const composed = composeClassDetails(pattern, resolved, context);
    for (const name of composed) {
      addCompletion({ name, theme: resolved, canBeNegative, isColor: false }, location);
    }
  }

  function isUncompletedPattern(pattern: string) {
    return pattern.endsWith('-');
  }
  function canBeNegativePattern(pattern: string) {
    return pattern.slice(0, 3).includes('-?');
  }
  function getClassNameDetails(match: MatchResult, resolver: RuleResolver<CurrentTheme>) {
    try {
      return resolver(match, {
        theme: themeResolver,
        s: () => '',
        d: () => {},
        h: (value) => value,
        f: (value) => value,
        e: escape,
        v: (value) => value,
        r: (value) => value,
      });
    } catch (error) {
      return null;
    }
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

function composeClassDetails(
  prefix: string,
  rule: RuleResult,
  context: AutocompleteContext<CurrentTheme>,
) {
  const composed: string[] = [];
  if (!rule) {
    const parts = prefix.split('-');
    if (parts[0]) {
      const checkPrefix = context.theme(parts[0]);
      if (checkPrefix && Object.keys(checkPrefix ?? {}).length) {
        composed.push(...composeClassPatterns(prefix, checkPrefix));
      } else {
        // console.log('NO_PREFIX: ', prefix, parts);
      }
    }
  } else {
    for (const prop of Object.keys(rule ?? {})) {
      if (!prop.startsWith('@') && !prop.startsWith('-')) {
        const themeValue = context.theme(prop) as any;

        if (themeValue && Object.keys(themeValue).length == 1) {
          composed.push(...composeClassPatterns(prefix, themeValue));
        } else {
          if (themeValue) {
            for (const [subProp] of Object.entries(themeValue)) {
              composed.push(...composeClassPatterns(prefix, themeValue[subProp]));
            }
          }
        }
      }
    }
  }
  return composed;
}
// interface AliasData<Section extends string> {
//   sections: Section[];
// }
// type UtilitiesAlias<T extends string, Sections extends string> = [T, AliasData<Sections>[]];

const createCondition = <T extends string>(
  sections: T[],
  conditions: ('startsWith' | 'endsWidth' | 'equals')[],
) => {
  return {
    sections,
    conditions,
  };
};

const utilitiesAlias = [
  ['max-h-', createCondition(['maxHeight'], ['startsWith'])],
  ['min-h-', createCondition(['minHeight'], ['startsWith'])],
  ['h-', createCondition(['height'], ['startsWith'])],
  ['max-w-', createCondition(['maxWidth'], ['startsWith'])],
  ['min-w-', createCondition(['minWidth'], ['startsWith'])],
  ['w-', createCondition(['width'], ['startsWith'])],
  ['leading-', createCondition(['lineHeight'], ['equals'])],
  ['divide-x', createCondition(['divideWidth'], ['startsWith'])],
  ['divide-y', createCondition(['divideWidth'], ['startsWith'])],
  ['cursor-', createCondition(['cursor'], ['equals'])],
  ['border-', createCondition(['borderWidth'], ['equals'])],
  ['border-x', createCondition(['borderWidth'], ['startsWith'])],
  ['border-y', createCondition(['borderWidth'], ['startsWith'])],
  ['border-t', createCondition(['borderWidth'], ['startsWith'])],
  ['border-l', createCondition(['borderWidth'], ['startsWith'])],
  ['border-b', createCondition(['borderWidth'], ['startsWith'])],
  ['border-r', createCondition(['borderWidth'], ['startsWith'])],
  ['stroke-', createCondition(['strokeWidth'], ['equals'])],
  ['ring-offset-', createCondition(['ringOffsetWidth'], ['startsWith'])],
  ['ring-', createCondition(['ringWidth'], ['startsWith'])],
  ['outline-', createCondition(['outlineWidth'], ['equals'])],
  ['columns-', createCondition(['columns'], ['equals'])],
] as const;

type SingleAlias = (typeof utilitiesAlias)[number];
const alias = (basePattern: string, theme: ThemeFunction<CurrentTheme>) => {
  const response: string[] = [];
  for (const [utilityName, data] of utilitiesAlias) {
    data.conditions.forEach((condition) => {
      response.push(...getConditionTheme(utilityName, basePattern, condition, data.sections));
    });
  }
  return response;
  function getConditionTheme(
    basePattern: string,
    utilityName: string,
    condition: 'startsWith' | 'endsWidth' | 'equals',
    themeSections: SingleAlias[1]['sections'],
  ) {
    return themeSections.flatMap((section) => {
      let compare =
        (condition == 'endsWidth' && utilityName.endsWith(basePattern)) ||
        (condition == 'startsWith' && utilityName.startsWith(basePattern)) ||
        (condition == 'equals' && utilityName == basePattern);

      if (compare) {
        const composed = composeClassPatterns(utilityName, theme(section));
        return composed;
      }
      return [];
    });
  }
  // return checker.find(([base]) => {
  //   if (basePattern.includes('opacity')) return false;
  // if (basePattern.startsWith('border-'))
  //   return (
  //     basePattern === 'border-' ||
  //     basePattern.startsWith('border-x') ||
  //     basePattern.startsWith('border-y') ||
  //     basePattern.startsWith('border-t') ||
  //     basePattern.startsWith('border-l') ||
  //     basePattern.startsWith('border-b') ||
  //     basePattern.startsWith('border-r')
  //   );
  //   return base === basePattern || basePattern.startsWith(base);
  // });
};
