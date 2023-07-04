import { getSelectorGroup } from '../helpers';

export const mapAsType =
  <A extends string>(type: A) =>
  <B>(value: B) => {
    return {
      type,
      value,
    };
  };

export const mapSelector = (selector: string) => ({
  group: getSelectorGroup(selector),
  value: selector,
});
