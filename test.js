const printArgs = (...args) => {
  args.forEach((item) => {
    if (typeof item === 'function') {
      console.log(item());
      return;
    }
    console.log(item);
  });
};

const a = 'test';
printArgs`Print me ${() => a}`;
