type ParserState<A> = [A, string][];

type StateTransformerFunction<T> = (state: string) => ParserState<T>;

const concat: any = [].concat.apply.bind([].concat, []);

class CssParser<A> {
  transform: StateTransformerFunction<A>;
  constructor(transformFn: StateTransformerFunction<A>) {
    this.transform = transformFn;
  }
  map<B>(f: (v: A) => B): CssParser<B> {
    const parser = this.transform;
    return new CssParser(function Parser$map$state(state): ParserState<B> {
      const newState = parser(state);
      return concat(newState.map((res) => [f(res[0]), res[1]]));
    });
  }

  run(target: string): ParserState<A> {
    const resultState = this.transform(target);

    if (resultState.length === 0) {
      return [];
    }
    return resultState;
  }

  static of<T>(x: T): CssParser<T> {
    return new CssParser((state) => concat([state, x]));
  }
}

const char = new CssParser((state) => {
  console.log('STATE: ', state);
  const nextChar = state[0];
  if (!nextChar) return [];
  return [[nextChar, state.slice(1)]];
})
  .map((x) => ({
    type: 'char',
    value: x,
  }))
  .run('asd'); //?

const unit = <A>(a: A): CssParser<A> => new CssParser((cs) => [[a, cs]]);

// currentParser.chain = <B>(f: (v: A) => Parser<B>) =>
//     makeParser<B>((cs) => concat(p(cs).map((res) => f(res[0])(res[1]))));

// currentParser.map = <B>(f: (v: A) => B) => currentParser.chain((v) => unit(f(v)));
