import { useState } from 'react';
import { Pressable, View, TextInput, TextInputProps } from '@universal-labs/primitives';
import clsx from 'clsx';
import { Control, useController } from 'react-hook-form';
import { AppIcons } from '../../common/icons';
import { useOnFocus } from '../../hooks/useOnFocus';
import { FieldSet } from '../fieldset';

interface TTextFieldProps extends TextInputProps {
  label: string;
  formField: string;
  kind?: 'email' | 'text' | 'password';
  control: Control<any>;
  isDisabled?: boolean;
  small?: boolean;
}

const TextField = ({
  label,
  formField,
  kind = 'text',
  control,
  isDisabled = false,
  small,
  ...props
}: TTextFieldProps) => {
  const { onFocus, onBlur, focused } = useOnFocus();
  const [hidePassword, setHidePassword] = useState(true);
  const { field, fieldState } = useController({
    control,
    name: formField,
  });
  const isInvalid = !!fieldState.error;
  return (
    <FieldSet
      focused={focused}
      small={small}
      hasValue={!!field.value}
      isInvalid={isInvalid}
      label={label}
      error={fieldState.error}
      isDisabled={isDisabled}
    >
      <View className='h-full flex-row'>
        <TextInput
          className={clsx(
            'font-roboto w-full border-none',
            'px-4 pt-2',
            'text-lg text-gray-700 outline-none',
            isDisabled && 'opacity-60',
          )}
          editable={!isDisabled}
          onChangeText={field.onChange}
          onBlur={onBlur}
          onFocus={onFocus}
          autoCapitalize='none'
          textContentType={kind === 'email' ? 'emailAddress' : undefined}
          keyboardType={kind === 'email' ? 'email-address' : undefined}
          value={field.value ?? ''}
          secureTextEntry={kind === 'password' && hidePassword}
          {...props}
        />
        {kind === 'password' ? (
          <Pressable
            onPress={() => setHidePassword(!hidePassword)}
            className='web:mt-2 ios:mt-3 absolute right-3'
          >
            <AppIcons color='gray' name={hidePassword ? 'eye' : 'eye-off'} size='lg' />
          </Pressable>
        ) : null}
      </View>
    </FieldSet>
  );
};

export { TextField };
