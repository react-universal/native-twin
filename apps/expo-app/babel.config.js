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
      [
        '@native-twin/babel/babel',
        {
          twinConfigPath: './tailwind.config.ts',
          cssInput: 'globals.css',
        },
      ],
    ],

    plugins: ['react-native-reanimated/plugin'],
  };
};
