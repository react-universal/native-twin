export const variables = function ({ addUtilities, theme }) {
  const rootVariables = theme('variables');
  const darkVariables = theme('darkVariables');

  if (rootVariables && Object.keys(rootVariables).length > 0) {
    addUtilities({
      ':root': theme('variables'),
    } as any);
  }

  if (darkVariables && Object.keys(darkVariables).length > 0) {
    addUtilities({
      ':root[dark]': theme('darkVariables'),
    } as any);
  }
};
