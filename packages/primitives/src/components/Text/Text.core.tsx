import { Platform, Text as NativeText, TextProps } from 'react-native';
import { styled } from '@react-universal/styled';
// @ts-expect-error
import { unstable_createElement } from 'react-native-web';
import type { TTypographyProps } from './types';

const createTextElement = (element: string, props: TextProps) => {
  if (Platform.OS !== 'web') return <NativeText {...props} />;
  return unstable_createElement(element, props);
};

const Span = styled((props: TTypographyProps) => createTextElement('span', props));

const H1 = styled(NativeText);
// styled((props: TTypographyProps) => createTextElement('h1', props));

const H2 = styled((props: TTypographyProps) => createTextElement('h2', props));

const H3 = styled((props: TTypographyProps) => createTextElement('h3', props));

const H4 = styled((props: TTypographyProps) => createTextElement('h4', props));

export { Span, H1, H2, H3, H4 };
