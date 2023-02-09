import { ComponentType, forwardRef } from 'react';
import clsx from 'clsx';
import { useStyle } from '../hooks/useStyled';

export const createStyledComponent = (
  Component: ComponentType,
  classValueOrOptions?: string | any,
  maybeOptions?: any,
) => {
  const { props, defaultProps } =
    typeof classValueOrOptions === 'object'
      ? classValueOrOptions
      : maybeOptions ?? ({} as any);

  const classProps: string[] = [];
  const extraTransform: Record<string, string> = {};

  if (props) {
    for (const [key, propOptions] of Object.entries(props)) {
      if (propOptions && typeof propOptions === 'object' && 'class' in propOptions) {
        classProps.push(key);
      } else if (typeof propOptions === 'string') {
        extraTransform[key] = propOptions;
      } else if (propOptions === true) {
        extraTransform[key] = key;
      }
    }
  }

  const hasExtraProps = props && Object.keys(extraTransform).length > 0;

  const Styled = forwardRef<unknown, any>(function ({ tw, className, ...props }, ref) {
    console.group('STYLED_COMPONENTS');
    console.log('CLASS_NAMES: ', className);
    console.log('TW_CLASS_NAMES: ', tw);
    console.log('PROPS: ', props);
    let processedProps = props;
    console.log('PROCESSED_PROPS_INIT: ', processedProps);
    const transformClassValue: string[] = [];

    if (hasExtraProps || classProps.length > 0) {
      processedProps = {};

      for (const [key, value] of Object.entries(props)) {
        if (extraTransform[key] && typeof value === 'string') {
          const newKey = key === extraTransform[key] ? key : extraTransform[key];

          processedProps[newKey] = { $$css: true, [value]: value };
        } else if (classProps.includes(key) && typeof value === 'string') {
          transformClassValue.push(value);
        } else {
          processedProps[key] = value;
        }
      }
    }

    console.log('TRANSFORM_CLASS_VALUES: ', transformClassValue);

    console.log('PROCESSED_PROPS_END: ', processedProps);

    const style = useStyle(
      clsx([transformClassValue.join(' '), tw ?? className]),
      props.style,
    );

    console.groupEnd();

    return <Component ref={ref} {...processedProps} style={style} />;
  });

  if (typeof Component !== 'string') {
    Styled.displayName = `Tailwind.${Component.displayName || Component.name || 'NoName'}`;
  }

  Styled.defaultProps = defaultProps;
  return Styled;
};
