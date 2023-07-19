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

export const injectClassNames = (classNames: string) => {
  const { tx, tw } = initialize();
  const restore = tw.snapshot();
  tx(classNames);
  const target = [...tw.target];
  restore();
  return target;
};

export const getTestParserData = (debug = false) => {
  const data = createParserContext({
    context: {
      debug,
      colorScheme: 'dark',
      deviceHeight: 1280,
      deviceWidth: 720,
      rem: 16,
      platform: 'ios',
    },
    cache: {
      get: () => null,
      set: () => {},
    },
  });
  return data;
};

export const generateStylesFor = (classNames: string, debug = false) => {
  const target = injectClassNames(classNames);
  const parserData = getTestParserData(debug);
  const parsed = CssResolver(target, {
    ...parserData.context,
    debug,
  });
  return parsed;
};
