import { Cell, flexRender } from '@tanstack/react-table';
import { UnknownOutputParams } from 'expo-router';
import type { RawJSXElementTreeNode } from '@native-twin/css/jsx';

interface CellProps {
  cell: Cell<RawJSXElementTreeNode, unknown>;
  params: UnknownOutputParams;
}
export const TableCell = ({ cell, params }: CellProps) => {
  return (
    <td
      key={cell.id}
      style={{
        width: cell.column.getSize(),
      }}
    >
      {flexRender(cell.column.columnDef.cell, cell.getContext())}
    </td>
  );
};
