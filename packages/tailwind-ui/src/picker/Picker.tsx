import { Picker as RNPicker } from '@react-native-picker/picker';
import type { TPickerProps } from './Picker.types';

const Picker = ({ value, onChangeValue, options }: TPickerProps) => {
  return (
    <RNPicker
      onValueChange={(v) => onChangeValue(v)}
      selectedValue={value}
      style={{
        width: '100%',
      }}
    >
      {options.map((item) => (
        <RNPicker.Item
          key={item.value}
          value={item.value}
          label={item.label}
          style={{
            textTransform: 'capitalize',
          }}
        />
      ))}
    </RNPicker>
  );
};

export default Picker;
