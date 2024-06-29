module.exports = function () {
  return {
    plugins: [require('./build').default],
  };
};
