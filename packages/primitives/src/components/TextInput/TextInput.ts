import type { ComponentProps } from 'react';
import { TextInput as NativeInput } from 'react-native';
import { styled, ForwardedStyledComponent } from '@universal-labs/styled';

const TextInput = styled(NativeInput) as ForwardedStyledComponent<NativeInput>;

type TextInputProps = ComponentProps<typeof NativeInput>;

export type { TextInputProps };

export default TextInput;
