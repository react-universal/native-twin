import { useCallback, useMemo, useState } from 'react';
import { Pressable, TextInput } from '@universal-labs/primitives';
import dayjs from 'dayjs';
import { useController } from 'react-hook-form';
import DateTimePickerModal from 'react-native-modal-datetime-picker';
import { FieldSet } from '../fieldset';
import type { ITimePickerProps } from './types';

const TimePicker = ({ control, fieldName, label, showError = true }: ITimePickerProps) => {
  const [visible, setVisible] = useState(false);
  const { field, fieldState } = useController({
    control,
    name: fieldName,
  });
  const onConfirm = useCallback(
    (date: Date | null) => {
      field.onChange(dayjs(date).toDate());
      setVisible(false);
    },
    [field],
  );
  const selectedTime = useMemo(() => dayjs(field.value).format('HH:mm'), [field.value]);
  return (
    <Pressable onPress={() => setVisible(true)} className='active:opacity-30'>
      <FieldSet
        focused={{ value: 1 }}
        hasValue={!!field.value}
        isInvalid={!!fieldState.error}
        error={showError ? fieldState.error : undefined}
        label={label}
        className='border-primary-50 border-2'
      >
        <TextInput
          editable={false}
          accessible={false}
          value={selectedTime}
          pointerEvents='none'
          className={`
            font-roboto
            native:px-5
            web:px-4
            h-full
            w-full
            border-none
            !bg-transparent
            pt-2
            text-lg
            text-gray-700
            outline-none
          `}
        />
        <DateTimePickerModal
          onConfirm={onConfirm}
          onCancel={() => setVisible(false)}
          isVisible={visible}
          mode='time'
          display='spinner'
        />
      </FieldSet>
    </Pressable>
  );
};

export { TimePicker };
