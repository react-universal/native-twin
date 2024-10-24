import { View } from 'react-native';
import { Link, UnknownOutputParams } from 'expo-router';
import type { RawJSXElementTreeNode } from '@native-twin/css/jsx';
import { Cell } from '@tanstack/react-table';

interface CellProps {
  cell: Cell<RawJSXElementTreeNode, unknown>;
  params: UnknownOutputParams;
}
export const TableLink = ({ cell, params }: CellProps) => (
  <View key={cell.id} className={`border-l-1 w-[${cell.column.getSize()}px]`}>
    <Link
      href={{
        pathname: `/file-tree/${cell.row.original.id}`,
        params: {
          id: cell.row.original.id,
          order: cell.row.original.order,
          ...params,
        },
      }}
    >
      Open Tree
    </Link>
  </View>
);
