/* eslint-disable no-console */
import { initialize } from '@universal-labs/twind-adapter';
import util from 'util';
import { CssResolver } from '../src';
import { createParserContext } from '../src/parsers/Parser';

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

export const generateStylesFor = (classNames: string) => {
  const { tx, tw } = initialize();
  const { context } = createParserContext({
    deviceHeight: 1280,
    deviceWidth: 720,
    rem: 16,
    platform: 'ios',
  });
  tx(classNames);
  const target = [...tw.target];
  tw.clear();
  return CssResolver(target, context);
};
