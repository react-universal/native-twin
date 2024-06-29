import type { VariantClassToken } from '@native-twin/css';
import { asArray } from '@native-twin/helpers';
import { TemplateTokenData } from '../template/models/template-token-data.model';
import { TemplateTokenWithText } from '../template/models/template-token.model';
import type { LocatedParser } from '../template/template.types';

export const getFlattenTemplateToken = (
  item: TemplateTokenWithText,
  base: TemplateTokenWithText | null = null,
): TemplateTokenData[] => {
  if (
    item.token.type === 'CLASS_NAME' ||
    item.token.type === 'ARBITRARY' ||
    item.token.type === 'VARIANT_CLASS' ||
    item.token.type === 'VARIANT'
  ) {
    if (!base) return asArray(new TemplateTokenData(item, base));

    if (base.token.type === 'VARIANT') {
      const className = `${base.token.value.map((x) => x.n).join(':')}:${item.text}`;
      return asArray(
        new TemplateTokenData(
          new TemplateTokenWithText(item.token, className, item.templateStarts),
          base,
        ),
      );
    }

    if (base.token.type === 'CLASS_NAME') {
      if (item.token.type === 'CLASS_NAME') {
        return asArray(
          new TemplateTokenData(
            new TemplateTokenWithText(
              item.token,
              `${base.token.value.n}-${item.text}`,
              item.templateStarts,
            ),
            base,
          ),
        );
      }

      if (item.token.type === 'VARIANT') {
        console.log(base, item);
      }

      if (item.token.type === 'VARIANT_CLASS') {
        const className = `${variantTokenToString(item.token)}${base.token.value.n}-${item.token.value[1].value.n}`;
        return asArray(
          new TemplateTokenData(
            new TemplateTokenWithText(item.token, className, item.templateStarts),
            base,
          ),
        );
      }
    }
  }

  if (item.token.type === 'GROUP') {
    const base = item.token.value.base;
    const classNames = item.token.value.content.flatMap((x) =>
      getFlattenTemplateToken(x, base),
    );
    return classNames;
  }

  return [];
};

const variantTokenToString = (token: LocatedParser<VariantClassToken>) =>
  `${token.value[0].value.map((x) => x.n).join(':')}:`;
