import renderer from 'react-test-renderer';
import { describe, expect, it } from 'vitest';
import { H1 } from '../src';

function toJson(component: renderer.ReactTestRenderer) {
  const result = component.toJSON();
  expect(result).toBeDefined();
  expect(result).not.toBeInstanceOf(Array);
  return result as renderer.ReactTestRendererJSON;
}

describe('@universal-labs/primitives', () => {
  it('H1 render', () => {
    const component = renderer.create(<H1 className='text-sm'>Test H1</H1>);
    let tree = toJson(component);
    expect(tree).toMatchSnapshot();
  });
});
