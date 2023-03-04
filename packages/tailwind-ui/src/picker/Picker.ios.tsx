import { useState } from 'react';
import { BottomSheetFlatList } from '@gorhom/bottom-sheet';
import { FieldSet } from '@medico/universal/fieldset';
import { ModalSheet } from '@medico/universal/modal-sheet';
import { Pressable, Span, View } from '@react-universal/primitives';
import type { TPickerProps } from './Picker.types';

const Picker = ({ value, onChangeValue, options, label, placeholder, icon }: TPickerProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const getValueToShow = () => {
    if (value !== '') {
      return options[options.findIndex((item) => String(item.value) === String(value))]!.label;
    }
    return placeholder ?? 'Select Option...';
  };
  return (
    <FieldSet
      focused={{ value: 1 }}
      hasValue
      isInvalid={false}
      label={label}
      className='w-full'
    >
      <Pressable onPress={() => setIsOpen(true)}>
        <View className='h-16 flex-row items-center justify-between px-2 py-2'>
          <Span className='text-primary-200 text-lg font-bold capitalize'>
            {getValueToShow()}
          </Span>
          {icon && icon}
        </View>
      </Pressable>
      <ModalSheet
        visible={isOpen}
        onClose={() => setIsOpen(false)}
        close={() => setIsOpen(false)}
        web_height={10}
      >
        <BottomSheetFlatList
          data={options}
          renderItem={({ item: option }) => {
            return (
              <Pressable
                key={`select-${option.value}`}
                onPress={() => {
                  onChangeValue(option.value);
                  setIsOpen(false);
                }}
                className={`
                my-1 rounded-xl bg-gray-200/50 py-3 px-4
                ${value === option.value ? 'bg-primary-200' : ''}
              `}
              >
                <Span
                  className={`
                    font-bold capitalize
                    ${value === option.value ? 'text-white' : ''}
                `}
                >
                  {option.label}
                </Span>
              </Pressable>
            );
          }}
        />
      </ModalSheet>
    </FieldSet>
  );
};

export default Picker;
