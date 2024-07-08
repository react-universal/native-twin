import { tw } from '@native-twin/core';
import { atom } from '../atomic.store';

export const twinConfigObservable = atom(tw.config);
if ('observeConfig' in tw) {
  tw.observeConfig((x) => {
    console.log('XXX: ', x);
  });
}
