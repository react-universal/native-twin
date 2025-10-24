// import { cx } from '@native-twin/core';
// import { type ComponentType, forwardRef } from 'react';
// import type { StyleProp } from 'react-native';
// import type { StyledComponentProps } from '../types/styled.types';
// import { getComponentDisplayName } from '../utils/getComponentDisplayName';

// function styledComponentsFactory<
//   StyleType,
//   InitialProps extends { style?: StyleProp<StyleType> },
//   Props extends InitialProps = InitialProps,
// >(Component: ComponentType<InitialProps>, _styledProp = 'style') {
//   const ForwardRefComponent = forwardRef<any, Props>(
//     // @ts-expect-error
//     (props: Props & StyledComponentProps, ref) => {
//       const classNames = cx(props.className ?? props.tw);
//       return (
//         <Component
//           {...props}
//           style={[
//             {
//               $$css: true,
//               [classNames]: classNames,
//             },
//             props.style,
//           ]}
//           ref={ref}
//         />
//       );
//     },
//   );
//   if (__DEV__) {
//     ForwardRefComponent.displayName = `Styled(${getComponentDisplayName(Component)})`;
//   }
//   return ForwardRefComponent as any;
// }

// export default styledComponentsFactory;

// export function invokeComponent<T>(Component: ComponentType<T>, props: T) {
//   // @ts-expect-error
//   return <Component {...props} />;
// }
