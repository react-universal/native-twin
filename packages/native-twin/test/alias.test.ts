import { apply } from '../src/runtime/alias';

test('alias proxy passthrough - func', () => {
  expect(apply['func']('bg-red text-white')).toStrictEqual('func#g069dp');
  expect(apply['func'].toString().replace(/[\s]/g, '')).toStrictEqual(
    `functionnamedAlias(strings,...interpolations){returnalias$(name,strings,interpolations);}`,
  );
});
