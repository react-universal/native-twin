export const selectorGenerator = (input: string) => {
  const startOfSelector = input.indexOf('.');
  const endOfSelector = input.indexOf('{');
  if (startOfSelector === -1 || endOfSelector === -1 || startOfSelector > endOfSelector) {
    return {
      isValid: false,
      selector: null,
    };
  }
  return {
    isValid: true,
    selector: input.slice(startOfSelector, endOfSelector),
  };
};
