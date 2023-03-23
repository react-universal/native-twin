import type { IExtraProperties } from '@universal-labs/stylesheets';

interface IComponentRegisterInput {
  inlineStyles: IExtraProperties<{}>['style'];
  parentID: string;
  classProps: Record<string, string>;
}
const useComponentRegister = (input: IComponentRegisterInput) => {};
