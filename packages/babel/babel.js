module.exports = function () {
  return {
    plugins: [
      require('./build').default,
      // [
      //   '@babel/plugin-transform-react-jsx',
      //   {
      //     runtime: 'automatic',
      //     importSource: '@native-twin/jsx',
      //   },
      // ],
    ],
  };
};
