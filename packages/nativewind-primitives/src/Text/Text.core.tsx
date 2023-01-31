import { ComponentProps, ComponentType, forwardRef } from 'react';
import { Platform, Text as NativeText, TextProps } from 'react-native';
import { createStyledComponent, mergeTWClasses } from '@react-universal/nativewind-utils';
// @ts-expect-error
import { unstable_createElement } from 'react-native-web';
import type { TTypographyProps } from './types';

type StyledTextProps = ComponentProps<typeof BaseText>;
type CommonTextProps = StyledTextProps;

const createTextElement = (element: string, props: TextProps) => {
  if (Platform.OS !== 'web') return <NativeText {...props} />;
  return unstable_createElement(element, props);
};

const BaseText = createStyledComponent(NativeText);
const BaseSpan = (props: TTypographyProps) => createTextElement('span', props);
const BaseH1 = (props: TTypographyProps) => createTextElement('h1', props);
const BaseH2 = (props: TTypographyProps) => createTextElement('h2', props);
const BaseH3 = (props: TTypographyProps) => createTextElement('h3', props);
const BaseH4 = (props: TTypographyProps) => createTextElement('h4', props);

const StyledSpan = createStyledComponent(BaseSpan);
const StyledH1 = createStyledComponent(BaseH1);
const StyledH2 = createStyledComponent(BaseH2);
const StyledH3 = createStyledComponent(BaseH3);
const StyledH4 = createStyledComponent(BaseH4);

type TextCoreProps = TTypographyProps & { Component: ComponentType<any> };

const Span = forwardRef(({ className, ...props }: CommonTextProps, ref) => {
  return <StyledSpan ref={ref} {...props} className={mergeTWClasses(className)} />;
});
Span.displayName = 'Span';

const H1 = forwardRef(({ className, ...props }: CommonTextProps, ref) => {
  return <StyledH1 ref={ref} className={mergeTWClasses(className)} {...props} />;
});
H1.displayName = 'H1';

const H2 = forwardRef(({ className, ...props }: CommonTextProps, ref) => {
  return <StyledH2 ref={ref} className={mergeTWClasses(className)} {...props} />;
});
H2.displayName = 'H2';

const H3 = forwardRef(({ className, ...props }: CommonTextProps, ref) => {
  return <StyledH3 ref={ref} className={mergeTWClasses(className)} {...props} />;
});
H3.displayName = 'H3';

function TextCore({ Component, ...props }: TextCoreProps) {
  return <Component {...props} />;
}

const H4 = forwardRef(({ className, ...props }: CommonTextProps, ref) => {
  return <StyledH4 ref={ref} className={mergeTWClasses(className)} {...props} />;
});
H4.displayName = 'H4';

export { Span, H1, H2, H3, H4, TextCore };
