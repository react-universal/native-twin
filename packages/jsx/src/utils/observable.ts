/**
 * Observer pattern implementation
 *
 * Observables are used to store reactive values. When you access the value of an Observable,
 * with an Effect, it will subscribe the Effect to the Observable. When the value of the Observable
 * is changed, it will rerun all subscribed Effects.
 */

export type Observable<T> = {
  // Used for debugging only
  name?: string;
  // Get the current value of the observable. If you provide an Effect, it will be subscribed to the observable.
  get(effect?: Effect): T;
  // Set the value and rerun all subscribed Effects
  set(newValue: T): void;
};

/**
 * An Effect is a function that will be rerun when its dependencies change.
 */
export type Effect = {
  rerun: (isRendering?: boolean) => void;
  dependencies: Set<() => void>;
};

export type ObservableOptions<T> = {
  fallback?: Observable<T>;
  name?: string;
  staticValue?: boolean;
};

export function observable<T>(
  value: T,
  { fallback, name, staticValue = false }: ObservableOptions<T> = {},
): Observable<T> {
  const effects = new Set<Effect>();

  return {
    name,
    get(effect) {
      if (effect && !staticValue) {
        // Subscribe the effect to the observable
        effects.add(effect);
        effect.dependencies.add(() => effects.delete(effect));
      }
      return value ?? fallback?.get(effect)!;
    },

    set(newValue: any) {
      if (staticValue || Object.is(newValue, value)) return;
      value = newValue;
      // We changed, so rerun all subscribed effects
      // We need to copy the effects set because rerunning an effect might resubscribe it
      for (const effect of [...effects]) {
        effect.rerun();
      }
    },
  };
}

export function cleanupEffect(effect: Effect) {
  for (const dep of effect.dependencies) {
    dep();
  }
  effect.dependencies.clear();
}
