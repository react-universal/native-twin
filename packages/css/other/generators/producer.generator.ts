/* eslint-disable no-console */
const interpretLog = (...args: any[]) => console.log(`[INTERPRETER]`, ...args);
const producerLog = (...args: any[]) => console.log(`\t[PRODUCER]`, ...args);

const producerGeneratorFn = function* (value: any) {
  producerLog('Fn argument: ', value);
  const a: number = yield 1;
  producerLog('a variable: ', a);
  const b: number = yield 2;
  producerLog('b variable: ', b);
  return 3;
};

const interpreter = (generatorFn: any) => {
  interpretLog('Creating the generator object');
  const producer = generatorFn('Starting value');
  let done = false;
  let lastValue = undefined;

  do {
    let produced: any = producer.next(lastValue);
    interpretLog('Get produced: ', produced);
    done = produced.done;
    lastValue = produced.value;
  } while (!done);
};

interpreter(producerGeneratorFn); //?
