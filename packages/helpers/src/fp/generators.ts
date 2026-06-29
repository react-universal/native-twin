const interpreterLogger = <A extends any[] = []>(...args: A) =>
  console.log('[interpreter]', ...args);

const producerLogger = <A extends any[] = []>(...args: A) => console.log('[producer]', ...args);

// const producerGenerator = function* <A extends any[] = never[]>(...value: A) {
//   producerLogger('function argument: ', ...value);
//   const a = yield 1;
//   producerLogger('a var was: ', a);
//   const b = yield 2;
//   producerLogger('b var was: ', b);
//   yield 3;
// };

// const interpreter = (generatorFn: <A extends any[]>(...x: A) => Generator) => {
//   interpreterLogger('creating the generator object');
//   const producer = generatorFn('Starting value');

//   let done = false;
//   let step = 1;
//   let lastValue: any;
//   while (!done) {
//     const produced = producer.next(lastValue * 200);
//     interpreterLogger(`${step++}.`, 'Got a produced value: ', produced);
//     done = !!produced.done;
//     lastValue = produced.value;
//   }
// };

// interpreter(producerGenerator);

/** 1. */

const producerGenerator = function* <A extends any[] = never[]>(...value: A) {
  producerLogger('function argument: ', ...value);
  yield 1;
  yield 2;
  yield 3;
};

const interpreter = (generatorFn: <A extends any[], X>(...x: A) => Generator) => {
  interpreterLogger('creating the generator object');
  const producer = generatorFn('Starting value');

  let produced = producer.next();

  interpreterLogger('1. Got a produced value: ', produced);

  produced = producer.next();
  interpreterLogger('2. Got a produced value: ', produced);

  produced = producer.next();
  interpreterLogger('3. Got a produced value: ', produced);

  produced = producer.next();
  interpreterLogger('4. Got a produced value: ', produced);

  produced = producer.next();
  interpreterLogger('5. Got a produced value: ', produced);
};

// const interpreter = (generatorFn: <A extends any[], X>(...x: A) => Generator) => {
//   interpreterLogger('creating the generator object');
//   const producer = generatorFn('Starting value');

//   let done = false;
//   let step = 1;
//   while (!done) {
//     const produced = producer.next();
//     interpreterLogger(`${step++}.`, 'Got a produced value: ', produced);
//     done = !!produced.done;
//   }
// };

interpreter(producerGenerator);
