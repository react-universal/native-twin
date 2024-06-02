import { TemplateTokenWithText } from '../models/template-token.model';
import { TemplateToken } from '../template.types';

export function addTextToParsedRules(
  groupContent: TemplateToken[],
  text: string,
  templateStarts: number,
  results: TemplateTokenWithText[] = [],
): TemplateTokenWithText[] {
  const nextToken = groupContent.shift();
  if (!nextToken) return results;
  if (nextToken.type == 'ARBITRARY' || nextToken.type === 'CLASS_NAME') {
    results.push(
      new TemplateTokenWithText(
        nextToken,
        text.slice(nextToken.start, nextToken.end),
        templateStarts,
      ),
    );
  }

  if (nextToken.type == 'VARIANT_CLASS') {
    results.push(
      new TemplateTokenWithText(
        nextToken,
        text.slice(nextToken.start, nextToken.end),
        templateStarts,
      ),
    );
  }

  if (nextToken.type === 'GROUP') {
    const newContent = addTextToParsedRules(
      nextToken.value.content,
      text.slice(nextToken.value.base.start, nextToken.value.base.end),
      templateStarts,
    ).flatMap((x) => {
      x.text = text.slice(x.loc.start, x.loc.end);
      return x;
    });

    const base = new TemplateTokenWithText(
      nextToken.value.base,
      text.slice(nextToken.value.base.start, nextToken.value.base.end),
      templateStarts,
    );

    results.push(
      new TemplateTokenWithText(
        {
          ...nextToken,
          value: {
            base: base,
            content: newContent,
          },
        },
        text.slice(nextToken.start, nextToken.end),
        templateStarts,
      ),
    );
  }
  return addTextToParsedRules(groupContent, text, templateStarts, results);
}
