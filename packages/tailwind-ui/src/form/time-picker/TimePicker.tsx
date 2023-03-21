import { useMemo, useState } from 'react';
import { useOnFocus } from '@universal-labs/hooks';
import { View, TextInput } from '@universal-labs/primitives';
import clsx from 'clsx';
import dayjs from 'dayjs';
import { useController } from 'react-hook-form';
import { FieldSet } from '../fieldset';
import { TimeList } from '../time-picker/TimeList';
import type { ITimePickerProps } from '../time-picker/types';

const TimePicker = ({ control, fieldName, label, showError }: ITimePickerProps) => {
  const { focused, onBlur, onFocus } = useOnFocus();
  const [showSelector, setShowSelector] = useState(false);
  const { field, fieldState } = useController({
    control,
    name: fieldName,
  });

  const value = useMemo(() => {
    return dayjs(field.value).format('HH:mm');
  }, [field.value]);

  return (
    <FieldSet
      focused={focused}
      hasValue={!!field.value}
      isInvalid={!!fieldState.error}
      error={showError ? fieldState.error : undefined}
      label={label}
      className='border-primary-50 relative overflow-visible border-2'
    >
      <TextInput
        value={value}
        onBlur={onBlur}
        onFocus={() => {
          setShowSelector(true);
          onFocus();
        }}
        className={clsx(
          'h-full border-none pl-4 pt-2',
          'font-roboto-medium text-lg',
          'text-gray-700 outline-none ring-0',
        )}
      />
      <View>
        <TimeList
          onClose={() => setShowSelector(false)}
          selectedTime={dayjs(field.value)}
          onChangeHour={(hour) => {
            const currentValue = dayjs(field.value).set('hour', Number(hour));
            field.onChange(currentValue.toDate());
          }}
          onChangeMinutes={(minutes) => {
            const currentValue = dayjs(field.value).set('minutes', Number(minutes));
            field.onChange(currentValue.toDate());
          }}
          show={showSelector}
        />
      </View>
    </FieldSet>
  );
};

export { TimePicker };
