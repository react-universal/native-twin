import type { ClassAttributes, ComponentProps, ComponentType } from 'react';
import { Text } from 'react-native';

type NativeTextProps = ComponentProps<typeof Text> & ClassAttributes<typeof Text>;

export type TableTextProps = NativeTextProps & {
  /** @platform web */
  colSpan?: number | string;
  /** @platform web */
  rowSpan?: number | string;
};

export const TableText = Text as ComponentType<TableTextProps>;
