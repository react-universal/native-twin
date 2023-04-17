import { TextInput as NativeInput } from 'react-native';
import { styled, ForwardedStyledComponent } from '@universal-labs/styled';

const TextInput = styled(NativeInput) as ForwardedStyledComponent<typeof NativeInput>;

export default TextInput;
