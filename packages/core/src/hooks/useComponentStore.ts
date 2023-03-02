import { useEffect, useState } from 'react';
import { createObservable } from '../store/observables';

function createComponentsStore<DataType>(initialValue: DataType) {
  const observable = createObservable(initialValue);
  return () => {
    const [state, setState] = useState(observable);
    useEffect(() => observable.subscribe(setState), []);
  };
}
