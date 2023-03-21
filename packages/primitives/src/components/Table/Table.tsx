import { ComponentType, forwardRef } from 'react';
import { StyleSheet } from 'react-native';
import Text, { TextProps } from '../Text/Text.primitive';
import { ViewProps, View } from '../View';
import { TableText, TableTextProps } from './Table.primitive';

export const Table = forwardRef((props: ViewProps, ref) => {
  return <View {...props} ref={ref} />;
}) as ComponentType<ViewProps>;
Table.displayName = 'Table';

export const THead = forwardRef((props: ViewProps, ref) => {
  return <View {...props} ref={ref} />;
}) as ComponentType<ViewProps>;
THead.displayName = 'THead';

export const TBody = forwardRef((props: ViewProps, ref) => {
  return <View {...props} ref={ref} />;
}) as ComponentType<ViewProps>;
TBody.displayName = 'TBody';

export const TFoot = forwardRef((props: ViewProps, ref) => {
  return <View {...props} ref={ref} />;
}) as ComponentType<ViewProps>;
TFoot.displayName = 'TFoot';

export const TH = forwardRef((props: TableTextProps, ref: any) => {
  return <TableText {...props} style={[styles.th, props.style]} ref={ref} />;
}) as ComponentType<TableTextProps>;
TH.displayName = 'TH';

export const TR = forwardRef((props: ViewProps, ref) => {
  return <View {...props} style={[styles.tr, props.style]} ref={ref} />;
}) as ComponentType<ViewProps>;

TR.displayName = 'TR';

export const TD = forwardRef((props: TableTextProps, ref: any) => {
  return <TableText {...props} style={[styles.td, props.style]} ref={ref} />;
}) as ComponentType<TableTextProps>;

TD.displayName = 'TD';

export const Caption = forwardRef((props: TextProps, ref: any) => {
  return <Text {...props} style={[styles.caption, props.style]} ref={ref} />;
}) as ComponentType<TextProps>;

Caption.displayName = 'Caption';

const styles = StyleSheet.create({
  caption: {
    textAlign: 'center',
    fontSize: 16 as number,
  },
  th: {
    textAlign: 'center',
    fontWeight: 'bold',
    flex: 1,
    fontSize: 16 as number,
  },
  tr: {
    flexDirection: 'row',
  },
  td: {
    flex: 1,
    fontSize: 16 as number,
  },
});
