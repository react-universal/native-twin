export const mapAsType =
  <A extends string>(type: A) =>
  <B>(value: B) => {
    return {
      type,
      value,
    };
  };
