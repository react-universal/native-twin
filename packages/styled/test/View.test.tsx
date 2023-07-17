/* eslint-disable no-console */
import { View, StyleSheet } from 'react-native';
import renderer from 'react-test-renderer';
import { describe, expect, it } from 'vitest';
import { styled } from '../src';

function toJson(component: renderer.ReactTestRenderer) {
  const result = component.toJSON();
  expect(result).toBeDefined();
  expect(result).not.toBeInstanceOf(Array);
  return result as renderer.ReactTestRendererJSON;
}

const StyledView = styled(View);

describe('@universal-labs/styled', () => {
  it('View render', () => {
    const component = renderer.create(<StyledView className='flex-1' />);
    const data = component.toJSON();
    //@ts-expect-error
    const styles = StyleSheet.flatten(data.props.style);
    console.log(styles, StyleSheet.flatten(styles));
    let tree = toJson(component);
    expect(tree).toMatchSnapshot();
  });
});
