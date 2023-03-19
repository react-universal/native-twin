import type { Control } from 'react-hook-form';

export interface ITimePickerProps {
  control: Control<any>;
  fieldName: string;
  label: string;
  showError?: boolean;
}
