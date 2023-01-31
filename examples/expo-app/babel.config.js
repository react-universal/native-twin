module.exports = function (api) {
  api.cache(true);
  return {
    presets: [['babel-preset-expo', { jsxRuntime: 'automatic' }]],
    plugins: ['nativewind/babel', ['react-native-reanimated/plugin']],
  };
};
