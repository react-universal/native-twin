// import { boolean } from 'effect/Equivalence';

import * as Option from 'effect/Option';
import { createJiti } from 'jiti';
import { transform } from 'sucrase';

// import { transform } from 'sucrase';

// let jiti: ReturnType<typeof jitiFactory> | null = null;

// function lazyJiti() {
//   return (
//     jiti ??
//     (jiti = jitiFactory(__filename, {
//       interopDefault: true,
//       // debug: true,
//       transform: (opts) => {
//         return transform(opts.source, {
//           transforms: ['typescript', 'imports'],
//         });
//       },
//     }))
//   );
// }

const jiti = createJiti(__filename, {
  debug: false,
  moduleCache: true,
  fsCache: false,
  transform: (opts) => {
    return transform(opts.source, {
      transforms: ['typescript', 'imports'],
    });
  },
});

const requireJSThrowable = async (path: string): Promise<any> => {
  const module = await jiti.import(path, { default: true, try: true });

  return module;
};

export const requireESM = <A>(path: string): Promise<Option.Option<A>> =>
  requireJSThrowable(path)
    .then((x) => Option.some(x))
    .catch(() => Option.none());
