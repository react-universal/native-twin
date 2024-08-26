import { Ref } from 'effect';
import * as Effect from 'effect/Effect';
import { pipe } from 'effect/Function';
import * as HashMap from 'effect/HashMap';
import * as Option from 'effect/Option';
import { JSXElementSheet } from '@native-twin/css/build/jsx';


export class StyleSheetModel {
  constructor(private value: Ref.Ref<HashMap.HashMap<string, JSXElementSheet>>) {}

  add(id: string, sheet: JSXElementSheet): Effect.Effect<void> {
    return Effect.sync(() => pipe(this.value, Ref.update(HashMap.set(id, sheet))));
  }

  get(id: string): Effect.Effect<Option.Option<JSXElementSheet>> {
    return pipe(this.value, Ref.get, Effect.map(HashMap.get(id)));
  }
}

export const makeBabelStyleSheet = Effect.andThen(
  Ref.make(HashMap.empty<string, JSXElementSheet>()),
  (value) => new StyleSheetModel(value),
);
