import { ComponentType, forwardRef } from 'react';
import clsx from 'clsx';
import { useStyled } from './hooks/useStyled';

const styled = (Component: ComponentType) => {
  const classProps: string[] = [];
  const extraTransform: Record<string, string> = {};

  const Styled = forwardRef<unknown, any>(function ({ tw, className, ...props }, ref) {
    console.group('STYLED_COMPONENTS');
    console.log('CLASS_NAMES: ', className);
    console.log('TW_CLASS_NAMES: ', tw);
    console.log('PROPS: ', props);
    let processedProps = props;
    console.log('PROCESSED_PROPS_INIT: ', processedProps);
    const transformClassValue: string[] = [];

    if (classProps.length > 0) {
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

    const style = useStyled({
      inlineStyles: props.style,
      className: clsx([transformClassValue.join(' '), tw ?? className]),
    });
    console.log('STYLE: ', style);
    console.groupEnd();

    return <Component ref={ref} {...processedProps} className={className} />;
  });

  if (typeof Component !== 'string') {
    Styled.displayName = `Tailwind.${Component.displayName || Component.name || 'NoName'}`;
  }
  return Styled;
};

export { styled };
export { mergeTWClasses } from './utils/mergeClasses';
