/* eslint-disable no-console */
import { initialize } from '@universal-labs/twind-adapter';
import util from 'util';
import { CssResolver } from '../src';
import { createParserContext } from '../src/parsers/Parser';

const inspectTestElement = (msg: string, target: string[], result: any) => {
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

export const generateStylesFor = (classNames: string, debug = false) => {
  const { tx, tw } = initialize();
  const { context } = createParserContext({
    deviceHeight: 1280,
    deviceWidth: 720,
    rem: 16,
    platform: 'ios',
  });
  const restore = tw.snapshot();
  tx(classNames);
  const target = [...tw.target];
  restore();
  const parsed = CssResolver(target, context);
  if (debug) {
    console.group('DEBUG');
    console.log('CLASS_NAMES: ', classNames);
    inspectTestElement('SHEET: ', target, parsed);
    console.groupEnd();
  }
  return parsed;
};
