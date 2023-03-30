import { useEffect } from 'react';
import { createObservable } from '../store/observables';

function useObservable() {
  const observable = createObservable(1);
  useEffect(
    () =>
      observable.subscribe((data) => {
        console.log(data);
      }),
    [observable],
  );
  return observable;
}

export { useObservable };
