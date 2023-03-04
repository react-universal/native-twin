import type { ReactNode } from 'react';

export interface TPickerProps {
  value: string;
  icon?: ReactNode;
  onChangeValue(value: string): void;
  options: {
    value: string;
    label: string;
  }[];
  label: string;
  placeholder?: string;
  valuePostfix?: string;
  w?: string;
  className?: string;
}
