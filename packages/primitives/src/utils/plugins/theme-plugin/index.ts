import plugin from 'tailwindcss/plugin';

const themePlugin = plugin(function ({ addBase, theme }) {
  addBase({
    h1: {
      fontSize: theme('fontSize.4xl'),
      backgroundColor: theme('colors.black'),
    },
  });
});

export { themePlugin };
