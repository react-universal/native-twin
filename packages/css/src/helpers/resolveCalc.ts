export const resolveCssCalc = (left: number, operator: string, right: number): number => {
  switch (operator) {
    case '+':
      return left + right;
    case '-':
      return left - right;
    case '*':
      return left * right;
    case '/':
      return left / right;
    default:
      return left;
  }
};
