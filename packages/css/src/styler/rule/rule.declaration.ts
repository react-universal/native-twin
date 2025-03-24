export interface GenericStyleValue<Type extends string, Value> {
  readonly type: Type;
  value: Value;
}

const declValueIdent =
  <Type extends string>(type: Type) =>
  <Value>(value: Value): GenericStyleValue<Type, Value> => ({ type, value });

const dimension = declValueIdent('dimension');
const color = declValueIdent('color');
const unknown = declValueIdent('unknown');

const valueTypeFromProp = (prop: string) => {};
