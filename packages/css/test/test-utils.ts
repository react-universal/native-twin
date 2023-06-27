/* eslint-disable no-console */
import util from 'util';

export const inspectTestElement = (msg: string, target: string[], result: any) => {
  console.log(
    msg,
    util.inspect(
      {
        target,
        result,
      },
      false,
      null,
      true,
    ),
  );
};
