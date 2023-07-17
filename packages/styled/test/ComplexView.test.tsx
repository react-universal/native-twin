/* eslint-disable no-console */
import { View as NativeView, StyleSheet, Text } from 'react-native';
import clsx from 'clsx';
import renderer from 'react-test-renderer';
import { describe, expect, it } from 'vitest';
import { styled } from '../src';

function toJson(component: renderer.ReactTestRenderer) {
  const result = component.toJSON();
  expect(result).toBeDefined();
  expect(result).not.toBeInstanceOf(Array);
  return result as renderer.ReactTestRendererJSON;
}

const View = styled(NativeView);
const H1 = styled(Text);

describe('@universal-labs/styled', () => {
  it('View render', () => {
    const component = renderer.create(
      <View
        className={clsx(
          'flex-1',
          'hover:(web:(bg-blue-600) ios:(bg-green-600) android:(bg-black))',
          'ios:(p-14 bg-rose-200 border-white border-2)',
          'android:(p-14 border-green-200 border-2 bg-gray-200)',
          'items-center justify-center md:border-3',
        )}
      >
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
    const data = component.toJSON();
    //@ts-expect-error
    const styles = StyleSheet.flatten(data.props.style);
    console.log(styles, StyleSheet.flatten(styles));
    let tree = toJson(component);
    expect(tree).toMatchSnapshot();
  });
});
