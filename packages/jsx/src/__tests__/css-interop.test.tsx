import { Text, View } from 'react-native';
import { render, act, fireEvent } from '@testing-library/react-native';
import { colorScheme } from '../store/observables/colorScheme.obs';
import { createMockComponent, resetComponents, resetStyles } from '../testing-library';

const testID = 'native-twin-element';

beforeEach(() => {
  resetStyles();
  resetComponents();
});

test('normal component', () => {
  const TwinView = createMockComponent(View, { className: 'style' });
  const TwinText = createMockComponent(Text, { className: 'style' });

  const tree = render(
    <TwinView testID={testID} className='bg-black hover:bg-white'>
      <TwinText className='text(white lg)'>Sample Text</TwinText>
    </TwinView>,
  );
  expect(tree).toMatchSnapshot();
});

test('dark mode', () => {
  const TwinView = createMockComponent(View, { className: 'style' });
  const TwinText = createMockComponent(Text, { className: 'style' });

  act(() => colorScheme.set('dark'));

  const tree = render(
    <TwinView testID={testID} className='bg-black hover:bg-white dark:bg-red'>
      <TwinText className='text(white lg)'>Sample Text</TwinText>
    </TwinView>,
  );

  expect(tree).toMatchSnapshot();
});

test('Interactions', async () => {
  const TwinPressable = createMockComponent(View, { className: 'style' });

  colorScheme.set('dark');
  const tree = render(
    <TwinPressable testID={testID} className='bg-black hover:(bg-gray-200)' />,
  );
  const button = tree.getByTestId(testID);

  await act(() => fireEvent(button, 'touchStart'));
  expect(button).toHaveStyle({ backgroundColor: 'rgba(229,231,235,1)' });
});

// test('mapping', () => {
//   const TwinView = createMockComponent(View, { className: 'differentStyleProp' });
//   const TwinText = createMockComponent(Text, { className: 'style' });

//   render(
//     <TwinView testID={testID} className='bg-black hover:bg-white'>
//       <TwinText className='text-white'>asd</TwinText>
//     </TwinView>,
//   );

//   const component = screen.getByTestId(testID);
//   // console.log('COMPONENT: ', inspect(component.props, false, 3, true));
//   screen.debug(screen.getByTestId(testID));
//   // expect(component.props).toEqual({
//   //   testID,
//   //   differentStyleProp: {
//   //     backgroundColor: 'rgba(0,0,0,1)',
//   //     color: 'rgba(255,255,255,1)',
//   //   },
//   // });
// });

// test('multiple mapping', () => {
//   const A = createMockComponent(View, { a: 'styleA', b: 'styleB' });

//   render(<A testID={testID} a='bg-black' b='text-white' />);

//   const component = screen.getByTestId(testID);

//   expect(component.props).toEqual({
//     testID,
//     styleA: {
//       backgroundColor: 'rgba(0,0,0,1)',
//     },
//     styleB: {
//       color: 'rgba(255,255,255,1)',
//     },
//   });
// });
