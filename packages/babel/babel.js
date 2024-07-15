module.exports = function (_, options) {
  return {
    plugins: [
      [require('./build').default, options],
      [
        '@babel/plugin-transform-react-jsx',
        {
          runtime: 'automatic',
          importSource: '@native-twin/jsx',
        },
      ],
    ],
  };
};
