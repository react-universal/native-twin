import clsx from 'clsx';
import renderer from 'react-test-renderer';
import { describe, expect, it } from 'vitest';
import styledComponents from '../src';

function toJson(component: renderer.ReactTestRenderer) {
  const result = component.toJSON();
  expect(result).toBeDefined();
  expect(result).not.toBeInstanceOf(Array);
  return result as renderer.ReactTestRendererJSON;
}

const View = styledComponents.View({
  base: clsx(
    'flex-1',
    'hover:(web:(bg-blue-600) ios:(bg-green-600) android:(bg-black))',
    'ios:(p-14 bg-rose-200 border-white border-2)',
    'android:(p-14 border-green-200 border-2 bg-gray-200)',
    'items-center justify-center md:border-3',
  ),
  variants: {
    intent: {
      primary: '',
      secondary: '',
      third: '',
    },
    active: {
      true: '',
      false: '',
    },
  },
  defaultProps: {
    active: true,
  },
});
const H1 = styledComponents.Text();

describe('@universal-labs/styled', () => {
  it('Complex View', () => {
    const component = renderer.create(
      <View intent='secondary'>
        <H1
          className={clsx(
            'text(center 2xl indigo-600)',
            'font-inter-bold hover:text-gray-700',
          )}
        >
          H1 - 1
        </H1>
      </View>,
    );
    let tree = toJson(component);
    expect(tree).toMatchSnapshot();
  });
});

const ScrollView = styledComponents.ScrollView({
  variants: {
    intent: { primary: '', sec: '' },
  },
});
describe('@universal-labs/styled', () => {
  it('ScrollView render', () => {
    const component = renderer.create(
      <ScrollView className='flex-1'>
        <View />
      </ScrollView>,
    );
    let tree = toJson(component);
    expect(tree).toMatchSnapshot();
  });
});
