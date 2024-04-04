module.exports = function (api) {
  api.cache(true);
  return {
    presets: [
      [
        'babel-preset-expo',
        {
          jsxImportSource: '@native-twin/jsx',
        },
      ],
      '@native-twin/babel/babel',
    ],

    plugins: [['react-native-reanimated/plugin']],
  };
};
