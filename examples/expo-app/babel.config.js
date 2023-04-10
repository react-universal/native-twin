module.exports = function (api) {
  api.cache(true);
  return {
    presets: [
      ['babel-preset-expo', { jsxRuntime: 'automatic' }],
      // [
      //   '@babel/preset-react',
      //   {
      //     runtime: 'automatic',
      //     development: true,
      //     importSource: '@welldone-software/why-did-you-render',
      //   },
      // ],
    ],

    plugins: [['react-native-reanimated/plugin']],
  };
};
