import {
  AutocompleteContext,
  MatchResult,
  Rule,
  RuleResolver,
  RuleResult,
  asArray,
  escape,
} from '@twind/core';
import genex from 'genex';
import { ClassCompletionItem, CurrentTheme } from '../types';
import { isSpacingFunction, toCondition } from '../utils';
import { ConfigurationManager } from '../language-service/configuration';

interface RuleCacheLocation {
  position: number;
  index: number;
}

export function createContextExecutor(context: AutocompleteContext<CurrentTheme>) {
  const suggestions: Map<string, ClassCompletionItem> = new Map();

  function ruleExecutor$(rule: Rule<CurrentTheme>, location: RuleCacheLocation) {
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
            match.$$ = generatedPattern.slice(match[0].length);
            const base = generatedPattern.replace(/\0/g, '');
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
          }
        });
      }
    }

    return suggestions;
  }

  return {
    run: ruleExecutor$,
    suggestions,
  };

  function addCompletion(
    input: Pick<ClassCompletionItem, 'name' | 'canBeNegative' | 'theme' | 'isColor'>,
    location: RuleCacheLocation,
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
    match: MatchResult,
    location: RuleCacheLocation,
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
    location: RuleCacheLocation,
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
        ...context,
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
