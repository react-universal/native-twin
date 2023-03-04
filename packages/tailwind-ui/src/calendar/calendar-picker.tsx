import { useState } from 'react';
import { Pressable } from '@react-universal/primitives';
import { View, TextInput } from '@react-universal/primitives';
import { Modal } from '../modal';
import { CalendarView } from './calendar';
import type { ICalendarPickerProps } from './types';

export const CalendarPicker = ({
  control,
  fieldName,
  label,
  disablePastDays,
}: ICalendarPickerProps) => {
  const [showDatePicker, setShowDatePicker] = useState(false);
  const onSelect = (date: string): void => {
    // field.onChange(date);
    setShowDatePicker(false);
  };
  return (
    <View className='z-[9999]'>
      <View className='mt-2 w-full items-center justify-center'>
        <Pressable onPress={() => setShowDatePicker(true)} className='w-full'>
          <TextInput className='mt-4 w-[100%] text-center text-lg' editable={false} />
        </Pressable>
      </View>
      <Modal
        onClose={() => {
          setShowDatePicker(false);
        }}
        visible={showDatePicker}
      >
        <CalendarView onPressDay={onSelect} disablePastDays={disablePastDays} />
      </Modal>
    </View>
  );
};
