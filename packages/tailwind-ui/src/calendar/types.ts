import type { Control } from 'react-hook-form';

export interface ICalendarPickerProps {
  label: string;
  small?: boolean;
  fieldName: string;
  control: Control<any>;
  disablePastDays?: boolean;
}
