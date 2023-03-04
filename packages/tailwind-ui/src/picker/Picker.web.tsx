import { View } from '@react-universal/primitives';
import type { TPickerProps } from './Picker.types';

const Picker = ({ value, onChangeValue, options, label, className }: TPickerProps) => {
  return (
    <View className={`relative flex-row justify-center pt-1 ${className}`}>
      <select
        value={value}
        placeholder={label}
        onChange={(event) => onChangeValue(event.target.value)}
        className='border-primary-50 h-12 flex-1 rounded-md border-2 pl-2 font-bold'
      >
        {options.map((item) => (
          <option key={item.value} value={item.value}>
            {item.label}
          </option>
        ))}
      </select>
    </View>
  );
};

export default Picker;
