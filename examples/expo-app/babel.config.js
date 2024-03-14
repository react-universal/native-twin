module.exports = function (api) {
  api.cache(true);
  return {
    presets: [
      [
        'babel-preset-expo',
        {
          jsxImportSource: '@universal-labs/native-twin-metro',
        },
      ],
      '@universal-labs/native-twin-babel/babel',
    ],

    plugins: [['react-native-reanimated/plugin']],
  };
};
