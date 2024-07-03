import { Text, View } from 'react-native';
import { render } from '@testing-library/react-native';
import { act } from 'react-test-renderer';
import { colorScheme } from '../observables';
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
