import { View } from 'react-native';
import { Cell } from '@tanstack/react-table';
import { Link, UnknownOutputParams } from 'expo-router';
import type { RawJSXElementTreeNode } from '@native-twin/css/jsx';

interface CellProps {
  cell: Cell<RawJSXElementTreeNode, unknown>;
  params: UnknownOutputParams;
}
export const TableLink = ({ cell, params }: CellProps) => (
  <View
    key={cell.id}
    className='border-l-1'
    style={{
      width: cell.column.getSize(),
    }}
  >
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
