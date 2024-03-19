import renderer from 'react-test-renderer';
import { defineConfig, setup } from '@native-twin/native-twin';
import { presetTailwind } from '@native-twin/preset-tailwind';
import { ScrollView, styled, View } from '../src';
import { createVariants } from '../src/styled/variants';

beforeAll(() => {
  setup(defineConfig({ presets: [presetTailwind()] }));
});

function toJson(component: renderer.ReactTestRenderer) {
  const result = component.toJSON();
  expect(result).toBeDefined();
  expect(result).not.toBeInstanceOf(Array);
  return result as renderer.ReactTestRendererJSON;
}

describe('@native-twin/styled', () => {
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

const viewVariants = createVariants({
  base: `
    flex-1
    hover:(bg-blue-600)
    p-14 bg-rose-200 border-white border-2
    items-center justify-center md:border-3
  `,
  variants: {
    intent: {
      primary: '',
      secondary: 'm-2',
      third: '',
    },
    active: {
      true: '',
      false: '',
    },
  },
  defaultVariants: {
    active: true,
  },
});
const H1 = styled.Text;

describe('@native-twin/styled', () => {
  it('Complex View', () => {
    const className = viewVariants({ intent: 'secondary' });
    const component = renderer.create(
      <View className={className}>
        <H1 className='text(center 2xl indigo-600) hover:text-gray-700'>H1 - 1</H1>
      </View>,
    );
    let tree = toJson(component);
    expect(tree).toMatchSnapshot();
  });
});

// NOT WORKING
// describe('@native-twin/styled', () => {
//   it('FlatList', () => {
//     const className = viewVariants({ intent: 'secondary' });
//     const component = renderer.create(
//       <FlatList
//         data={[{ key: 'i1' }, { key: 'i2' }]}
//         renderItem={(props) => (
//           <H1 className='text(center 2xl indigo-600) hover:text-gray-700'>{props.item.key}</H1>
//         )}
//         className={className}
//         keyExtractor={(i) => i.key}
//       />,
//     );
//     let tree = toJson(component);
//     expect(tree).toMatchSnapshot();
//   });
// });
