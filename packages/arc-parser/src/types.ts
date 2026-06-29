export type StateTransformerFunction<Result, Data = any> = (
  state: ParserState<any, any>,
) => ParserState<Result, Data>;

export type ParserState<Result, Data> = {
  target: DataView;
  inputType: InputTypes
} & InternalResultType<Result, Data>;

export type InternalResultType<Result, Data> = {
  isError: boolean;
  error: string | null;
  cursor: number;
  result: Result;
  data: Data;
};

export type ResultType<Result, Data> = ParserSuccess<Result, Data> | ParserError<Data>;

export type ParserError<Data> = {
  isError: true;
  error: string | null;
  cursor: number;
  data: Data;
};

export type ParserSuccess<Result, Data> = {
  isError: false;
  cursor: number;
  result: Result;
  data: Data;
};

export type TypedArray =
  | Int8Array
  | Uint8Array
  | Int16Array
  | Uint16Array
  | Int32Array
  | Uint32Array
  | Uint8ClampedArray
  | Float32Array
  | Float64Array;

export type InputType = string | ArrayBuffer | DataView | TypedArray;

export const isTypedArray = (x: any) =>
  x instanceof Uint8Array ||
  x instanceof Uint8ClampedArray ||
  x instanceof Int8Array ||
  x instanceof Uint16Array ||
  x instanceof Int16Array ||
  x instanceof Uint32Array ||
  x instanceof Int32Array ||
  x instanceof Float32Array ||
  x instanceof Float64Array;

export enum InputTypes {
  STRING = 'string',
  ARRAY_BUFFER = 'arrayBuffer',
  TYPED_ARRAY = 'typedArray',
  DATA_VIEW = 'dataView',
}
