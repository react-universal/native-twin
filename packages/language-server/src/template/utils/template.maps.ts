import { TemplateTokenWithText } from '../template.models';
import { TemplateToken } from '../template.types';

export function addTextToParsedRules(
  groupContent: TemplateToken[],
  text: string,
  results: TemplateTokenWithText[] = [],
): TemplateTokenWithText[] {
  const nextToken = groupContent.shift();
  if (!nextToken) return results;
  if (nextToken.type == 'ARBITRARY' || nextToken.type === 'CLASS_NAME') {
    results.push(
      new TemplateTokenWithText(nextToken, text.slice(nextToken.start, nextToken.end)),
    );
  }

  if (nextToken.type == 'VARIANT_CLASS') {
    results.push(
      new TemplateTokenWithText(nextToken, text.slice(nextToken.start, nextToken.end)),
    );
  }

  if (nextToken.type === 'GROUP') {
    const newContent = addTextToParsedRules(
      nextToken.value.content,
      text.slice(nextToken.value.base.start, nextToken.value.base.end),
    ).flatMap((x) => {
      x.text = text.slice(x.loc.start, x.loc.end);
      return x;
    });

    results.push(
      new TemplateTokenWithText(
        {
          ...nextToken,
          value: {
            base: {
              ...nextToken.value.base,
              text: text.slice(nextToken.value.base.start, nextToken.value.base.end),
            },
            content: newContent,
          },
        },
        text.slice(nextToken.start, nextToken.end),
      ),
    );
  }
  return addTextToParsedRules(groupContent, text, results);
}
