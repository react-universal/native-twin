import { TwinRuleWithCompletion } from '../../native-twin/nativeTwin.types';

export function getDocumentation({ completion, rule }: TwinRuleWithCompletion) {
  if (!rule.property || !completion.declarationValue) return '';
  const result: string[] = [];
  // result.push('***Css Rules*** \n\n');
  // result.push(`${'```css\n'}${data.css}${'\n```'}`);
  // result.push('\n\n');
  const prop = completion.declarations.reduce(
    (prev, current) => {
      return {
        [current]: completion.declarationValue,
        ...prev,
      };
    },
    {} as Record<string, any>,
  );
  result.push('***React Native StyleSheet*** \n\n');
  result.push(`***className: ${completion.className}*** \n\n`);
  result.push(`${'```json\n'}${JSON.stringify(prop, null, 2)}${'\n```'}`);
  return result.join('\n\n');
}
