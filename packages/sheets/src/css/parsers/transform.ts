import type { Transform } from '../css.types';

function read2D(prefix: 'translate' | 'scale' | 'skew', value: string) {
  const [x, y = '0px'] = value.split(',').map((val) => val.trim()) as string[];
  return [{ [prefix + 'X']: x }, { [prefix + 'Y']: y }];
}

function read3D(prefix: 'rotate', value: string): Transform[] {
  const [x, y, z] = value.split(',').map((val) => val.trim());
  const transform = [];
  if (!y && !z && x) {
    transform.push({ [prefix]: x });
    return transform;
  }
  if (x) transform.push({ [prefix + 'X']: x });
  if (y) transform.push({ [prefix + 'Y']: y });
  if (z) transform.push({ [prefix + 'Z']: z });
  return transform;
}

export function transform(value: string) {
  // Parse transform operations
  const transform = [...value.matchAll(/(\w+)\((.*?)\)/gm)].reduce((acc, val) => {
    const operation = val[1];
    const values = val[2]?.trim();
    if (!values || !operation) {
      return acc;
    }
    if (['translate', 'scale', 'skew'].includes(operation)) {
      return acc.concat(read2D(operation as 'translate' | 'scale' | 'skew', values));
    } else if (operation === 'rotate3d') {
      return acc.concat(read3D('rotate', values));
    } else if (operation === 'rotate') {
      return acc.concat(read3D('rotate', values));
    } else {
      return acc.concat({ [operation]: values });
    }
  }, [] as Transform[]);
  return { transform };
}
