export interface RuleDataType<Tag extends string, Value> {
  readonly _tag: Tag;
  readonly value: Value;
}

const createDataType =
  <Tag extends string>(_tag: Tag) =>
  <Value>(value: Value): RuleDataType<Tag, Value> => ({ _tag, value });

const textual = createDataType('textual');
const numeric = createDataType('numeric');
const quantity = createDataType('quantity');
const color = createDataType('color');

export const ruleDataType = { textual, numeric, quantity, color };
